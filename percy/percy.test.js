// Percy screenshot is not an assertion, but that's ok
/* eslint-disable jest/expect-expect */
import execa from 'execa'
import puppeteer from 'puppeteer'

const percySnapshot = require('@percy/puppeteer')

const OTP_RR_TEST_CONFIG_PATH = '../percy/har-mock-config.yml'
const { OTP_RR_PERCY_CALL_TAKER, OTP_RR_PERCY_MOBILE } = process.env
const OTP_RR_TEST_JS_CONFIG_PATH = OTP_RR_PERCY_CALL_TAKER
  ? './percy/har-mock-config-call-taker.js'
  : './percy/har-mock-config.js'

const MOCK_SERVER_PORT = 5486

// Puppeteer can take a long time to load, especially in some ci environments
jest.setTimeout(600000)

// How long to wait for each page to fully render before taking a screenshot
const PERCY_EXTRA_WAIT = 5000
const percySnapshotWithWait = async (page, name, enableJavaScript) => {
  await page.waitForTimeout(PERCY_EXTRA_WAIT)

  const namePrefix = process.env.PERCY_OTP_CONFIG_OVERRIDE || 'Mock OTP1 Server'
  await percySnapshot(
    page,
    `${OTP_RR_PERCY_CALL_TAKER ? 'Call Taker - ' : ''}${namePrefix} - ${name}`,
    { enableJavaScript }
  )
}

let browser
const serveAbortController = new AbortController()
const harAbortController = new AbortController()

/**
 * Loads a path
 */
async function loadPath(otpPath) {
  const page = await browser.newPage()
  const filePath = `http://localhost:${MOCK_SERVER_PORT}/#${otpPath}`
  await Promise.all([
    page.goto(filePath),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ])

  return page
}

beforeAll(async () => {
  try {
    // Build OTP-RR main.js using new config file
    await execa('env', [
      `YAML_CONFIG=${
        process.env.PERCY_OTP_CONFIG_OVERRIDE || OTP_RR_TEST_CONFIG_PATH
      }`,
      `JS_CONFIG=${OTP_RR_TEST_JS_CONFIG_PATH}`,
      'yarn',
      'build'
    ])
    console.log('Built OTP-RR')

    // grab ATL har file to tmp
    if (process.env.HAR_URL) {
      await execa('curl', [process.env.HAR_URL, '-s', '--output', 'mock.har'])
      console.log('Downloaded HAR data')
    }
  } catch (error) {
    console.log(error)
  }
  console.log('Built OTP-RR and downloaded HAR data')

  try {
    execa('yarn', ['percy-serve', 'dist', '-p', MOCK_SERVER_PORT], {
      signal: serveAbortController.signal
    }).stdout.pipe(process.stdout)

    // Launch mock OTP server
    if (process.env.HAR_URL) {
      execa('yarn', ['percy-har-express', '-p', '9999', 'mock.har'], {
        signal: harAbortController.signal
      }).stdout.pipe(process.stdout)
    }

    // Web security is disabled to allow requests to the mock OTP server
    browser = await puppeteer.launch({
      args: ['--disable-web-security']
      // ,headless: false
    })
  } catch (error) {
    console.log(error)
  }

  // Give servers time to start up
  await execa('sleep', ['5'])
})

afterAll(async () => {
  try {
    serveAbortController.abort()
    harAbortController.abort()
    await browser.close()
  } catch (error) {
    console.log(error)
  }
  console.log('Closed mock server and headless browser')
})

// Puppeteer can take a long time to load, espeically in some ci environments
jest.setTimeout(600000)

/* These fixed routes allow us to test features that the static html screenshots
 * don't allow us to test. This is disabled, as percy doesn't support transitive.js
 * out of the box, even with javascript enabled.
 *
 * TODO: make transitive.js work with Percy, then complete this test suite
 */
// eslint-disable-next-line jest/no-commented-out-tests
/*
test('OTP-RR Fixed Routes', async () => {
  const transitive = await loadPath(
    '/?ui_activeSearch=5rzujqghc&ui_activeItinerary=0&fromPlace=Opus Music Store%2C Decatur%2C GA%3A%3A33.77505%2C-84.300178&toPlace=Five Points Station (MARTA Stop ID 908981)%3A%3A33.753837%2C-84.391397&date=2022-03-09&time=09%3A58&arriveBy=false&mode=WALK%2CBUS%2CSUBWAY%2CTRAM%2CFLEX_EGRESS%2CFLEX_ACCESS%2CFLEX_DIRECT&showIntermediateStops=true&maxWalkDistance=1207&optimize=QUICK&walkSpeed=1.34&ignoreRealtimeUpdates=true&wheelchair=false&numItineraries=3&otherThanPreferredRoutesPenalty=900'
  )
  await percySnapshotWithWait(transitive, 'Itinerary (with transitive)', true)

  const routes = await loadPath('/route')
  await percySnapshotWithWait(routes, 'Route Viewer (with transitive)', true)
})
*/

async function executeTest(page, isMobile, isCallTaker) {
  // Make sure that the main UI (incl. map controls) has loaded.
  await page.waitForSelector('.maplibregl-ctrl-zoom-in')

  // Load itinerary from URL
  // Triggers mock.har graphql query #1 and #2 (bike-only query, twice).
  // FIXME: Opening a url with non-default mode params triggers the plan query twice.
  await page.goto(
    `http://localhost:${MOCK_SERVER_PORT}/#/?modeButtons=walk_bike&ui_activeSearch=44y0eq1ce&fromPlace=Opus%20Music%20Store%2C%20Decatur%2C%20GA%3A%3A33.77505%2C-84.300178&toPlace=Five%20Points%20Station%20%28908981%29%3A%3A33.753837%2C-84.391397&date=2023-08-09&time=10%3A42&arriveBy=false&showIntermediateStops=true&walkSpeed=1.34&ignoreRealtimeUpdates=true&numItineraries=3&otherThanPreferredRoutesPenalty=900`
  )
  // FIXME: Network idle condition seems never met after navigating to above link.
  // await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.waitForTimeout(2000)
  await page.waitForSelector('.option.metro-itin')

  if (!isCallTaker) {
    // Edit trip params [mobile-specific]
    if (isMobile) {
      await page.click('button.edit-search-button')
    }

    // Change the modes: Activate Transit and remove Bike.
    await page.click('label[title="Transit"]')
    await page.waitForTimeout(200)

    // FIXME: Must click Edit again [mobile-specific]
    if (isMobile) {
      await page.click('button.edit-search-button')
    }
    await page.click('label[title="Bike"]')
    await page.waitForTimeout(200)
    // Change the date
    // FIXME: Must click Edit again [mobile-specific]
    if (isMobile) {
      await page.click('button.edit-search-button')
    }
    await page.hover('#date-time-button')
    await page.focus('input[type="date"]')
    // FIXME: Puppeteer only: On Wednesday 08/09/2023, Monday 08/07/2023 was shown as "Last Sunday"!...
    await page.keyboard.type('08072023') // MMDDYYYY format.
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Check submode selector (this will have no effect on mock query)
    await page.hover('label[title="Transit"]')
    await page.waitForTimeout(500)
    await page.click('#id-query-param-tram')

    // Enable accessible routing (this will have no effect on mock query)
    // FIXME: Must click Edit again [mobile-specific]
    if (isMobile) {
      await page.click('button.edit-search-button')
    }
    await page.hover('label[title="Transit"]')
    await page.waitForTimeout(500)
    await page.click('#id-query-param-wheelchair')
    await page.waitForTimeout(200)

    // Triggers mock.har graphql query #3 and #4 (transit and walk-alone queries).
    // FIXME: Must click Edit again [mobile-specific]
    if (isMobile) {
      await page.click('button.edit-search-button')
    }
    await page.hover('#plan-trip')
    await page.click('#plan-trip')
    await page.waitForTimeout(1000) // wait extra time for all results to load

    if (!isMobile) {
      await page.hover('label[title="Transit"]')
      await page.waitForTimeout(200)
      await percySnapshotWithWait(
        page,
        'Metro Transit-Walk Itinerary Desktop with Mode Selector Expanded'
      )
      // Hover something else to unhover the mode selector.
      await page.hover('#plan-trip')
    } else {
      await percySnapshotWithWait(page, 'Metro Transit-Walk Itinerary Mobile')
    }
  } else {
    await page.waitForTimeout(1000) // wait extra time for all results to load

    // add intermediate stop
    await page.click(
      '#main > div > div > div > div.sidebar.col-md-4.col-sm-6 > main > div > div.form > button'
    )
    await page.waitForSelector('.intermediate-place-0-form-control')
    await page.focus('.intermediate-place-0-form-control')
    await page.keyboard.type('arts center')
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    await page.click('.search-plan-button-container button')
    await page.waitForTimeout(2000)

    // take screenshot
    await percySnapshotWithWait(page, 'Call Taker With Settings Adjusted')
  }

  // Select a trip
  await page.waitForSelector('.option.metro-itin:nth-of-type(1)')
  await page.click('.option.metro-itin:nth-of-type(1)')

  await percySnapshotWithWait(page, 'Metro Itinerary Selected')

  // Open Trip Viewer
  // Triggers mock.har graphql query #5 (trip).
  await page.waitForTimeout(2000)
  const [tripViewerButton] = await page.$x("//a[contains(., 'Trip Viewer')]")

  // If the trip viewer button didn't appear, perhaps we need to click the itinerary again
  if (!tripViewerButton) {
    await page.click('.option.metro-itin:nth-of-type(1)')
    await page.waitForTimeout(2000)
  }

  await tripViewerButton.click()
  await page.waitForSelector('div.trip-viewer-body')
  await page.waitForTimeout(1000)
  await percySnapshotWithWait(page, 'Trip Viewer')

  // Open stop viewer from trip viewer
  // Triggers mock.har graphql query #6, #7, and #8 (stop details, nearest places, nearest stops).
  await page.click(
    'div.trip-viewer-body > ol > li:nth-child(3) > div.stop-button-container > button'
  )
  await page.waitForSelector('.stop-viewer')

  await percySnapshotWithWait(page, 'Stop Viewer')

  // Open schedule view
  await page.waitForSelector('button.link-button.pull-right')
  await page.click('button.link-button.pull-right')
  await page.waitForTimeout(500)
  // Request a schedule for a specific valid date in the past,
  // so it is different than today and triggers a full render of the schedule.
  await page.focus('input[type="date"]')
  await page.keyboard.type('08072023') // MMDDYYYY format.
  await page.waitForTimeout(2000)
  await percySnapshotWithWait(page, 'Schedule Viewer')

  // Open route viewer
  // Triggers mock.har graphql query #9.
  // FIXME: This action also results in a probably unneeded query to index/stops returning a large dataset.
  if (isMobile) {
    await page.click('.app-menu-icon')
    // Wait for animation
    await page.waitForTimeout(200)
    // Take screenshot of the sidebar while we are at it.
    await percySnapshotWithWait(page, 'Mobile Sidebar')
  }

  const [routeViewerButton] = await page.$x(
    "//button[contains(., 'View Routes')]"
  )
  await routeViewerButton.click()
  await page.waitForSelector('.route-viewer')
  await page.waitForTimeout(5000)

  await percySnapshotWithWait(page, 'Route Viewer')

  // Open Specific Route
  // Triggers mock.har graphql query #10 (route details), #11 and #12 (vehicle positions, twice).
  // FIXME: Investigate why twice.
  try {
    await page.$x("//span[contains(., 'Marietta Blvd')]")
  } catch {
    await page.reload({ waitUntil: 'networkidle0' })
  }
  const [busRouteButton] = await page.$x("//span[contains(., 'Marietta Blvd')]")
  await busRouteButton.click()

  await page.waitForTimeout(500)

  // click the little pattern arrow
  // Triggers mock.har graphql query #13 and #14 (vehicle positions, twice again).
  // FIXME: Investigate why twice.
  await page.click('#open-route-button-1')

  // View the other pattern on the selected route.
  await page.click('#headsign-selector-label')
  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await page.waitForTimeout(500)

  // Go back to the first one.
  await page.click('#headsign-selector-label')
  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await page.waitForTimeout(1000)

  await percySnapshotWithWait(page, 'Pattern Viewer Showing Route 1')

  // Stop viewer from pattern viewer
  // Triggers mock.har graphql query #15 (stop info), #16 (nearest amenities), #17 (stops by radius).
  await page.click('ol > li:nth-of-type(1) > button')
  await page.waitForSelector('.stop-viewer')
  await page.waitForTimeout(1000)

  // Activate all layers
  // TODO: mocks for the layers.
  /*
  await page.$$eval('.maplibregl-map .layers-list input', (checks) =>
    checks.forEach((c) => c.click())
  )
  await page.waitForTimeout(1000)
  */

  // Go back to trip planner
  if (isMobile) {
    await page.click('.app-menu-icon')
    // Wait for animation
    await page.waitForTimeout(200)
  }
  const [planTripTabButton] = await page.$x(
    "//button[contains(., 'Plan Trip')]"
  )
  await planTripTabButton.click()
  await page.waitForSelector('.option')
  await page.waitForTimeout(3000)
  const [viewAllOptionsButton] = await page.$x(
    "//button[contains(., 'View all options')]"
  )
  await viewAllOptionsButton.click()
  await page.waitForTimeout(1000)

  // Need to explicitly select the first itinerary to reset map position
  await page.goto(`${page.url()}&ui_activeItinerary=-1`)
  await page.waitForTimeout(2000)
}

if (OTP_RR_PERCY_MOBILE) {
  test('OTP-RR Mobile', async () => {
    const page = await loadPath('/')
    await page.setUserAgent('android')
    await page.setViewport({
      height: 1134,
      width: 750
    })
    // Need to reload to load mobile view properly
    await page.reload()

    // Execute the rest of the test
    await executeTest(page, true, false)

    /*
    await page.waitForSelector('.welcome-location')
    await page.click('.welcome-location div input')
    await page.waitForSelector('.to-form-control')

    await page.focus('.to-form-control')
    await page.keyboard.type('ashby')
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    // Wait for page to load
    await page.waitForTimeout(300)

    await page.click('.from-form-control')
    // Wait for page to load
    await page.waitForTimeout(300)

    await page.focus('.from-form-control')
    await page.keyboard.type('amazon ATL5')
    await page.waitForTimeout(2000)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)
    await page.keyboard.press('Enter')

    await page.waitForTimeout(300)
    await page.click('.switch-button')

    await page.waitForSelector('.route-block-wrapper')
    await percySnapshotWithWait(page, 'Mobile Itinerary Results')

    await page.click('.route-block-wrapper')
    await percySnapshotWithWait(page, 'Mobile Itinerary Selected')

    await page.click('.button-container:nth-of-type(2)')
    await page.waitForTimeout(500)
    await percySnapshotWithWait(page, 'Mobile Printable Itinerary')
    */
  })
} else {
  test('OTP-RR', async () => {
    const page = await loadPath('/')
    await page.setViewport({
      height: 1080,
      width: 1920
    })
    page.on('console', async (msg) => {
      const args = await msg.args()
      args.forEach(async (arg) => {
        const val = await arg.jsonValue()
        // value is serializable
        if (JSON.stringify(val) !== JSON.stringify({})) console.log(val)
        // value is unserializable (or an empty oject)
        else {
          const { description, subtype, type } = arg._remoteObject
          console.log(
            `type: ${type}, subtype: ${subtype}, description:\n ${description}`
          )
        }
      })
    })
    // log all errors that were logged to the browser console
    page.on('warn', (warn) => {
      console.log(warn)
    })
    page.on('error', (error) => {
      console.error(error)
      console.error(error.stack)
    })
    // log all uncaught exceptions
    page.on('pageerror', (error) => {
      console.error(`Page Error: ${error}`)
    })
    // log all failed requests
    page.on('requestfailed', (req) => {
      console.error(`Request failed: ${req.method()} ${req.url()}`)
    })

    await executeTest(page, false, false)
  })
}
