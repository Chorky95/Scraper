import { schedule } from '@netlify/functions'
import getData from '../../express/getData'

console.log('Starting scheduler...')

const handler = schedule('* * * * *', () => {
  
  getData();

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