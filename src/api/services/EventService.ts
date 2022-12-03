import {Service} from 'typedi';
import Web3 from 'web3';
import {RegisterQuery} from '../controllers/requests/EventType';
import {env} from '../../env';
import {buildForwardTxRequest, getBiconomyForwarderConfig} from './BiconomyForwarderHelpers';
import {ABI} from '../../config/constant';

@Service()
export class EventService {
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

        return request;

    }
}
