import { RestClientV5 } from 'bybit-api'
import dotenv from 'dotenv'
import path from 'path'

const isProd = true

dotenv.config({
	path: path.resolve(process.cwd(), isProd ? '.env.prod' : '.env.dev'),
})

const API_KEY = process.env.BYBIT_API_KEY
const API_SECRET = process.env.BYBIT_API_SECRET

if (!API_KEY || !API_SECRET) {
	throw new Error('BYBIT_API_KEY and BYBIT_API_SECRET must be set in .env file')
}

const client = new RestClientV5({
	key: API_KEY,
	secret: API_SECRET,
	testnet: false, // Set to true for testnet
})

async function getAccountBalance() {
	try {
		const response = await client.getWalletBalance({
			accountType: 'SPOT', // or 'CONTRACT' or 'SPOT' depending on your account type
		})

		if (response.retCode === 0 && response.result.list) {
			const balances = response.result.list[0].coin.map((coin) => ({
				coin: coin.coin,
				equity: coin.equity,
				usdValue: coin.usdValue,
				walletBalance: parseFloat(coin.walletBalance).toFixed(3),
			}))

			console.table(balances)
		} else {
			console.error('No balance data available')
		}

		if (response.retCode === 0) {
			console.log('Account Balance:', response.result.list)
		} else {
			console.error('Error fetching balance:', response.retMsg)
		}
	} catch (error) {
		console.error('Error:', error)
	}
}

getAccountBalance()
