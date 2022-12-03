import {Service} from 'typedi';
import Web3 from 'web3';
import {PostRegisterQuery, RegisterQuery, SignedUserQuery} from '../controllers/requests/EventType';
import { fromRpcSig, addHexPrefix, hashPersonalMessage, ecrecover, pubToAddress } from 'ethereumjs-util';
import {env} from '../../env';
import {buildForwardTxRequest, getBiconomyForwarderConfig, getDataToSignForPersonalSign} from './BiconomyForwarderHelpers';
import {ABI} from '../../config/constant';
import got from 'got';
import {UtilService} from './UtilService';

@Service()
export class EventService {

    constructor(
        private utilService: UtilService,
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

        // const adminUrl = 'https://rails-admin-api.herokuapp.com';
        // const adminUrl = 'http://localhost:3001';
        const adminUrl = env.ethIndia.adminUrl;
        const url = `${adminUrl}/events/${registerQuery.eventId}`;

        const event: any = await got(url).json();
        console.log(event);

        const body = {
            name: event.name,
            description: 'The Event with web3 ticketing',
            image: 'ipfs://QmVucKoZZ4tP5HgU37UkZix5kWCKK87TXddBRmJZyXcwnz',
            attributes: [
                {trait_type: 'event', value: 'The event 2022'},
            ],
        };
        const ipfsResponse: any = await this.utilService.pinJSONToIPFS(body);

        const functionSignature: any = ethIndiaContract.methods
            .freeMint(ipfsResponse?.url)
            .encodeABI();
        const txGas: any = await ethIndiaContract.methods
            .freeMint(ipfsResponse?.url)
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

    public async getNftData(query: RegisterQuery): Promise<any> {

        const url = `https://api.covalenthq.com/v1/137/address/${query.address}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=true&key=ckey_8e6054f8ee1847c59ddbffd5ed6`;

        const nftDetails: any = await got(url).json();

        // tslint:disable-next-line:max-line-length
        const userNft = nftDetails.data.items.find(item => item?.type === 'nft' && item?.contract_address?.toLowerCase() === env.ethIndia.nftAddress.toLowerCase());
        return userNft;
    }

    public async confirmSignedUser(signedUserQuery: SignedUserQuery): Promise<any> {
        try {
            const web3 = new Web3(new Web3.providers.HttpProvider(env.ethIndia.polygonUrl));
            const {data} = signedUserQuery;
            const message = 'Example `personal_sign` message';
            const sig = fromRpcSig(addHexPrefix(data));
            const msg = hashPersonalMessage(Buffer.from(message));
            const publicKey = ecrecover(msg, sig.v, sig.r, sig.s);
            const pubAddress = pubToAddress(publicKey);
            const address = addHexPrefix(pubAddress.toString('hex'));
            const ethIndiaContract = new web3.eth.Contract(
                ABI,
                env.ethIndia.nftAddress
            );
            const nftresponse: number = await ethIndiaContract.methods
                .freeMintedList(address)
                .call();
            const nftId: number = Number(nftresponse);

            const adminUrl = env.ethIndia.adminUrl;
            const url = `${adminUrl}/users/${address}`;
            const user: any = await got(url).json();
            if (user && user.verified) {
                throw new Error(`${address} is already verified`);
            } else {
                if (nftId && nftId >= 0) {
                    const updateUserUrl = `${adminUrl}/users/update_user/?address=${address}`;
                    // tslint:disable-next-line:no-shadowed-variable
                    const user: any = await got(updateUserUrl).json();
                    console.log(user);
                    return {
                        success: true,
                        message: `${nftId}`,
                    };
                } else {
                    return {
                        success: false,
                        message: 'verification failed',
                    };
                }
            }

        } catch (err) {
            return {
                error: {
                    code: 503,
                    message: err.toString(),
                },
            };
        }
    }
}
