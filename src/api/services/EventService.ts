import {Service} from 'typedi';
import Web3 from 'web3';
import {PostRegisterQuery, RegisterQuery} from '../controllers/requests/EventType';
import {env} from '../../env';
import {buildForwardTxRequest, getBiconomyForwarderConfig, getDataToSignForPersonalSign} from './BiconomyForwarderHelpers';
import {ABI} from '../../config/constant';

@Service()
export class EventService {

    constructor(
        private web3: any
    ) {
        this.web3 = new Web3(
            new Web3.providers.HttpProvider(env.ethIndia.polygonUrl)
        );
    }
    public async getRegisterData(registerQuery: RegisterQuery): Promise<any> {
        const web3 = new Web3(new Web3.providers.HttpProvider(env.ethIndia.polygonUrl));
        const networkId: any = env.ethIndia.networkId;
        const userAddress: any = registerQuery.address;
        const nftContractAddress: any = env.ethIndia.nftAddress;

        const ethIndiaContract = new web3.eth.Contract(
            ABI,
            nftContractAddress
        );

        const functionSignature: any = ethIndiaContract.methods
            .freeMint('string')
            .encodeABI();
        const txGas: any = await ethIndiaContract.methods
            .freeMint('string')
            .estimateGas({from: userAddress});

        const forwarder: any = await getBiconomyForwarderConfig(networkId);
        forwarder.address = '0xf0511f123164602042ab2bCF02111fA5D3Fe97CD';
        const forwarderContract = new web3.eth.Contract(
            forwarder.abi,
            forwarder.address
        );

        const batchId: any = 0;
        const batchNonce: any = await forwarderContract.methods.getNonce(userAddress, 0).call();
        const gasLimitNum: any = Number(txGas);
        const to: any = nftContractAddress;
        const request = await buildForwardTxRequest({
            account: userAddress,
            to,
            gasLimitNum,
            batchId,
            batchNonce,
            data: functionSignature,
        });

        const hashToSign = await getDataToSignForPersonalSign(request);
        const rawData: any = Object.values(hashToSign);
        const dataToSign =  this.web3.utils.bytesToHex(rawData);
        const reqestedData = JSON.stringify(request);
        return {dataToSign, request: reqestedData};
    }

    public async register(query: PostRegisterQuery): Promise<object> {
        const requestedData = JSON.parse(query.request);
        const  params = [requestedData, query.sign_data];
        const signatureType = 'PERSONAL_SIGN';
        const dappId: any = env.ethIndia.dappId;
        const apiKey: any = env.ethIndia.apiKey;
        const nftContractAddress: any = env.ethIndia.nftAddress;
        const request = {
            to: nftContractAddress,
            apiId: dappId,
            params,
            from: requestedData.from,
            signatureType,
        };
        try {
            const res =  await fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify(request),
            }).then((response) => response.json());
            if (res?.txHash) {
                console.log(res?.txHash);
            }
            return res;
        } catch (error) {
            return error;
        }
    }
}
