import { schedule } from '@netlify/functions'

console.log('Starting scheduler...')

const handler = schedule('* * * * *', () => {
  exec("node express/server.js", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
  });
})

export {
  handler
}


// const handler = schedule('0 7 * * 1-6', async () => {
//     console.log('Restarting build...')
//     await fetch(BUILD_HOOK, {
//       method: 'POST'
//     }).then(response => {
//       console.log('Build hook response:', response)
//     })
  
//     return {
//       statusCode: 200
//     }
//   })

// export {
//   handler
// }

//cd ./node_modules/puppeteer npm run install cd ../../