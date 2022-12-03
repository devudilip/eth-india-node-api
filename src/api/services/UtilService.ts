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

    public async uploadMetaData(body: any): Promise<object> {
        const url = `https://ipfs.infura.io:5001/api/v0/add?pin=true`;
        const options = {
            json: body,
            headers: {
                Authorization:
                    'Basic MklQdGdxRlBLaGFOMDVzVVFDc1dUUzdmRUI4OmM0ZTFlYTgzYjE2YjkwZjE0MDY4MmFlYTYzYjQ2YTkw',
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
}
