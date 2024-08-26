import Chart from 'chart.js/auto'
import { KlineIntervalV3, RestClientV5 } from 'bybit-api'
import dotenv from 'dotenv'

dotenv.config()

const API_KEY = process.env.BYBIT_API_KEY || ''
const API_SECRET = process.env.BYBIT_API_SECRET || ''

const client = new RestClientV5({
	key: API_KEY,
	secret: API_SECRET,
	testnet: true, // Set to true for testnet
})

async function getHistoricalPriceData(symbol: string, interval: KlineIntervalV3, limit: number) {
	try {
		const response = await client.getKline({
			category: 'linear',
			symbol: symbol,
			interval: interval,
			limit: limit,
		})

		if (response.retCode === 0) {
			console.log(`Historical price data for ${symbol}:`)
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
			console.table(tableData)
		} else {
			console.error('Error fetching historical price data:', response.retMsg)
		}

		if (response.retCode === 0) {
			const prices = response.result.list.map((candle: any) => ({
				x: new Date(Number(candle[0])),
				y: parseFloat(candle[4]), // Close price
			}))

			createPriceChart(symbol, prices)
		}
	} catch (error) {
		console.error('Error:', error)
	}
}

function createPriceChart(symbol: string, prices: { x: Date; y: number }[]) {
	const ctx = document.getElementById('priceChart') as HTMLCanvasElement
	new Chart(ctx, {
		type: 'line',
		data: {
			datasets: [
				{
					label: `${symbol} Price`,
					data: prices,
					borderColor: 'rgb(75, 192, 192)',
					tension: 0.1,
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'day',
					},
				},
			},
		},
	})
}
