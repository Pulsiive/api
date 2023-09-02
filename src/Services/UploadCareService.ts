import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { deleteFile, listOfFiles, UploadcareSimpleAuthSchema } from '@uploadcare/rest-client';

const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY || '',
  secretKey: process.env.UPLOADCARE_SECRET_KEY || ''
});

class UploadCareService {
  static async deleteFileFromId(uuid: string) {
    const result = await deleteFile(
      {
        uuid
      },
      { authSchema: uploadcareSimpleAuthSchema }
    );
    return result;
  }

  static async uploadFile(fileName: string, filePath: string, store: boolean = true) {
    const formData = new FormData();
    formData.append('UPLOADCARE_PUB_KEY', process.env.UPLOADCARE_PUBLIC_KEY);
    formData.append('UPLOADCARE_STORE', store ? 1 : 0); //the file will be stored permanently until explicitly deleted.
    formData.append('file', fs.readFileSync(filePath), fileName);
    const upload = await axios.post('https://upload.uploadcare.com/base/', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    return upload.data;
  }

  static async getFiles() {
    const result = await listOfFiles(
      { ordering: '-datetime_uploaded' },
      { authSchema: uploadcareSimpleAuthSchema }
    );
    return result;
  }
}

export default UploadCareService;
