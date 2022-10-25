import { schedule } from '@netlify/functions'
// import { response } from 'express';
// import getData from '../../express/getData'

console.log('Starting scheduler...')

const handler = schedule('* * * * *', async () => {
  console.log('4546');
  
  await fetch('express/server.js', {
    method: 'POST'
  }).then(response => {
    console.log('Done:', response)
  });

  console.log('hwerhwsdh');

  return {
    statusCode: 200
  }
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