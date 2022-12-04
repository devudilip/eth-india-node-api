import got from 'got';
import { Service } from 'typedi';

import { env } from '../../env';

@Service()
export class UtilService {
    public async pinJSONToIPFS(body: any): Promise<object> {
        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        const options = {
            json: body,
            headers: {
                pinata_api_key: env.pinata.key,
                pinata_secret_api_key: env.pinata.secret,
            },
        };
        let result;
        try {
            result = await got.post(`${url}`, options).json();
        } catch (err) {
            throw new Error(`IPFS upload error`);
        }
        return {
            success: true,
            url: `ipfs://${result?.IpfsHash}`,
        };
    }

    public async uploadMetaData(body_data: any): Promise<object> {

        const adminUrl = env.ethIndia.adminUrl;
        const url = `${adminUrl}/users/uploadMetadata`;

        // const url = `https://ipfs.infura.io:5001/api/v0/add?pin=true`;
        const options = {
            json: {body: body_data},
        };
        let result;
        try {
            result = await got.post(`${url}`, options).json();
        } catch (err) {
            throw new Error(`IPFS upload error`);
        }
        return {
            success: true,
            url: `ipfs://${result?.Hash}`,
        };
    }
}
