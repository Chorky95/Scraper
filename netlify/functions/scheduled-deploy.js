const { schedule } = require('@netlify/functions');

const BUILD_HOOK = "https://api.netlify.com/build_hooks/63550d353255bf5920840f06";

console.log('Starting scheduled deployment...')

const handler = schedule('* * * * *', async () => {
    await fetch(BUILD_HOOK, {
        method: 'POST'
      }).then((response) => {
        console.log('Build hook response:', response.json())
    })

    return {
        statusCode: 200
    }
})

export {
  handler
}