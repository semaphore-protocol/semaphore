import { ethers } from "ethers";
import * as fs from 'fs';
const deployedSemaphore = JSON.parse(fs.readFileSync('./deployments/localhost/Semaphore.json', { encoding: 'utf-8' }));
const provider = ethers.providers.getDefaultProvider('http://localhost:8545');
const Semaphore = new ethers.Contract(deployedSemaphore.address, deployedSemaphore.abi, provider);

beforeAll(async () => {

})

test('Semaphore proof', async () => {
});