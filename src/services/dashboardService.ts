import { Transaction } from '@/types'

export const dashboardService = {
  calculateStats(transactions: Transaction[]) {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let totalIncome = 0
    let totalExpense = 0
    let currentMonthIncome = 0
    let currentMonthExpense = 0
    let lastMonthIncome = 0
    let lastMonthExpense = 0

    transactions.forEach((t) => {
      const amount = Number(t.amount)
      const date = new Date(t.created_at)
      
      if (t.type === 'income') {
        totalIncome += amount
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) currentMonthIncome += amount
        if (date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear) lastMonthIncome += amount
      } else {
        totalExpense += amount
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) currentMonthExpense += amount
        if (date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear) lastMonthExpense += amount
      }
    })

    const balance = totalIncome - totalExpense
    
    // Calculate Monthly Growth % for balance
    const currentMonthBalance = currentMonthIncome - currentMonthExpense
    const lastMonthBalance = lastMonthIncome - lastMonthExpense
    let monthlyGrowth = 0
    if (lastMonthBalance !== 0) {
      monthlyGrowth = ((currentMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100
    } else if (currentMonthBalance > 0) {
      monthlyGrowth = 100
    }

    return {
      balance,
      totalIncome,
      totalExpense,
      monthlyGrowth: Number(monthlyGrowth.toFixed(1)),
      currentMonthIncome,
      currentMonthExpense
    }
  },

  calculateChartData(transactions: Transaction[]) {
    // Basic aggregation for the area chart (last 7 days or weeks)
    // For simplicity, we'll aggregate by date string
    const aggregated: Record<string, { income: number; expenses: number }> = {}

    // Sort ascending for chart
    const sorted = [...transactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    sorted.forEach(t => {
      const dateStr = new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (!aggregated[dateStr]) {
        aggregated[dateStr] = { income: 0, expenses: 0 }
      }
      if (t.type === 'income') aggregated[dateStr].income += Number(t.amount)
      else aggregated[dateStr].expenses += Number(t.amount)
    })

    return Object.keys(aggregated).map(key => ({
      name: key,
      income: aggregated[key].income,
      expenses: aggregated[key].expenses
    }))
  }
}
