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
  }
}
