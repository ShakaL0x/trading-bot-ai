import { fifteenMinsData as data } from './data/15mins'

interface DataPoint {
	timestamp: number
	close: number
	open: number
	high: number
	low: number
	volume: number
	quoteVolume: number
}

interface Trade {
	type: 'buy' | 'sell'
	price: number
	amount: number
	timestamp: number
}

function calculateSMA(data: number[], period: number): number[] {
	const sma: number[] = []
	for (let i = period - 1; i < data.length; i++) {
		const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
		sma.push(sum / period)
	}
	return sma
}

function simulateTrades(data: DataPoint[]): Trade[] {
	const trades: Trade[] = []
	const closePrices = data.map((d) => d.close)
	const shortSMA = calculateSMA(closePrices, 10)
	const longSMA = calculateSMA(closePrices, 30)

	let inPosition = false

	for (let i = 30; i < data.length; i++) {
		if (shortSMA[i - 20] > longSMA[i - 30] && !inPosition) {
			// Buy signal
			trades.push({
				type: 'buy',
				price: data[i].close,
				amount: 1,
				timestamp: data[i].timestamp,
			})
			inPosition = true
		} else if (shortSMA[i - 20] < longSMA[i - 30] && inPosition) {
			// Sell signal
			trades.push({
				type: 'sell',
				price: data[i].close,
				amount: 1,
				timestamp: data[i].timestamp,
			})
			inPosition = false
		}
	}

	return trades
}

function calculatePnL(trades: Trade[]): number {
	let pnl = 0
	for (let i = 0; i < trades.length; i += 2) {
		const buy = trades[i]
		const sell = trades[i + 1]
		if (sell) {
			pnl += sell.price - buy.price
		}
	}
	return pnl
}

function mapDataToDataPoint(row: any[]): DataPoint {
	return {
		timestamp: Number(row[0]),
		open: Number(row[1]),
		high: Number(row[2]),
		low: Number(row[3]),
		close: Number(row[4]),
		volume: Number(row[5]),
		quoteVolume: Number(row[6]),
	}
}

// Ensure that 'data' is of type DataPoint[] before passing it to simulateTrades
const simulatedTrades = simulateTrades(data.map(mapDataToDataPoint))
const totalPnL = calculatePnL(simulatedTrades)

console.log('Simulated trades:', simulatedTrades)
console.log('Total PnL:', totalPnL)
