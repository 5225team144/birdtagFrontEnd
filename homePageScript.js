const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');

async function uploadFile() {
      
      
      if (!fileInput.files.length) {
        status.textContent = "Please choose a file first!";
        return;
      }

      const file = fileInput.files[0];
      const fileName = encodeURIComponent(file.name);
      const fileType = file.type;

      // 1. Ask Lambda for the pre-signed URL
      const lambdaResponse = await fetch('https://cgakkpreci.execute-api.us-east-1.amazonaws.com/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: fileName,
          file_type: fileType
        })
      });
      console.log("Lambda request sent with file name:", fileName, "and file type:", fileType);
      console.log("Lambda response:", lambdaResponse);

      console.log("Lambda response status:", lambdaResponse.status);
      if (!lambdaResponse.ok) {
        status.textContent = "❌ Failed to get upload URL!";
        return;
      } else {
        status.textContent = "✅ Got upload URL, starting upload...";
      }

      const lambdaData = await lambdaResponse.json();

      const uploadURL = lambdaData.uploadURL || lambdaData.body?.uploadURL;


      // const uploadURL = JSON.parse(lambdaData.body).uploadURL;
      console.log("upload url:", uploadURL)

      // 2. Upload file to S3 using the pre-signed URL
      const s3UploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType
        },
        body: file
      });

      if (s3UploadResponse.ok) {
        status.textContent = "🎉 Upload successful!";
      } else {
        status.textContent = "❌ Upload failed!";
      }
    }