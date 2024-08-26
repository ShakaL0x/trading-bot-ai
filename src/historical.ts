import { KlineIntervalV3, RestClientV5 } from 'bybit-api'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config()

const API_KEY = process.env.BYBIT_API_KEY || ''
const API_SECRET = process.env.BYBIT_API_SECRET || ''

const client = new RestClientV5({
	key: API_KEY,
	secret: API_SECRET,
	testnet: true, // Set to true for testnet
})

export async function getHistoricalPriceData(symbol: string, interval: KlineIntervalV3, limit: number): Promise<any> {
	try {
		const response = await client.getKline({
			category: 'linear',
			symbol: symbol,
			interval: interval,
			limit: limit,
		})

		if (response.retCode === 0) {
			console.log(`Historical price data for ${symbol}:`)
			console.log(response.result.list[0])
			const tableData = response.result.list.map((candle: any) => ({
				Time: new Date(Number(candle[0])).toLocaleString('en-GB', {
					day: '2-digit',
					month: '2-digit',
					// year: "numeric",
					hour: '2-digit',
					minute: '2-digit',
				}),
				Open: parseFloat(candle[1]),
				High: parseFloat(candle[2]),
				Low: parseFloat(candle[3]),
				Close: parseFloat(candle[4]),
				Volume: parseFloat(candle[5]),
			}))

			fs.writeFileSync('./data.json', JSON.stringify(response.result.list.slice(0, 111)))
			console.log('Data written to data.json')
			console.table(tableData)
		} else {
			console.error('Error fetching historical price data:', response.retMsg)
		}
	} catch (error) {
		console.error('Error fetching historical price data:', error)
	}
}

const symbol = 'ZROUSDT'
const interval: KlineIntervalV3 = '1'
const limit = 1000
getHistoricalPriceData(symbol, interval, limit) // Get 10 15-minute candles for BTC/USDT
