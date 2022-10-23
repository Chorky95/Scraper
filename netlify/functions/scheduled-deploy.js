//https://api.netlify.com/build_hooks/63528ae9386d020f6e1d349b

const fetch = require('node-fetch')
import { schedule } from '@netlify/functions'

// This is sample build hook
const BUILD_HOOK = 'https://api.netlify.com/build_hooks/63550d353255bf5920840f06'

const handler = schedule('29 12 * * *', async () => {
    await fetch(BUILD_HOOK, {
      method: 'POST'
    }).then(response => {
      console.log('Build hook response:', response)
    })
  
    return {
      statusCode: 200
    }
  })

export {
  handler
}

//cd ./node_modules/puppeteer npm run install cd ../../