const {google} = require('googleapis');

const drive = google.drive({
    version: 'v3',
    auth: 'AIzaSyBrG6CKfmOkWlqKf3g7uvMBOXhsRW0avDc'
  });
  
  async function run(){
    const res = await drive.files.create({
        requestBody: {
        name: 'Test',
        mimeType: 'text/plain'
        },
        media: {
        mimeType: 'text/plain',
        body: 'Hello World'
        }
    });
}

run();