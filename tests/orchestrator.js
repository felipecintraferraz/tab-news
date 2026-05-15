import retry from "async-retry"

async function waitForAllServices() {
  console.log("chamou orchestrator")
  await waitForWebServer()

  async function waitForWebServer() {
    console.log("Esperando web Server")
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000
    })

    async function fetchStatusPage() {
      console.log("####### LOOP DE RETRY #########")
      const response = await fetch(`http://localhost:3000/api/v1/status`)
      await response.json()
    }
  }
}

export default {
  waitForAllServices
}
