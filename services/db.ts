
import { UserPortfolio } from '../types.ts';
import { MOCK_PORTFOLIOS } from '../constants.ts';

const DB_KEY = 'portfoliox_portfolios';

export const db = {
  async getPortfolios(): Promise<UserPortfolio[]> {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      this.savePortfolios(MOCK_PORTFOLIOS);
      return MOCK_PORTFOLIOS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse database", e);
      return MOCK_PORTFOLIOS;
    }
  },

  async savePortfolio(portfolio: UserPortfolio): Promise<void> {
    const portfolios = await this.getPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolio.id);
    if (index !== -1) {
      portfolios[index] = portfolio;
    } else {
      portfolios.unshift(portfolio);
    }
    this.savePortfolios(portfolios);
  },

  savePortfolios(portfolios: UserPortfolio[]): void {
    localStorage.setItem(DB_KEY, JSON.stringify(portfolios));
  },

  async deletePortfolio(id: string): Promise<void> {
    const portfolios = await this.getPortfolios();
    const filtered = portfolios.filter(p => p.id !== id);
    this.savePortfolios(filtered);
  },

  async ratePortfolio(portfolioId: string, userId: string, value: number): Promise<UserPortfolio | null> {
    const portfolios = await this.getPortfolios();
    const portfolio = portfolios.find(p => p.id === portfolioId);

    if (portfolio) {
      if (!portfolio.ratings) portfolio.ratings = [];
      const existingRatingIndex = portfolio.ratings.findIndex(r => r.userId === userId);

      if (existingRatingIndex !== -1) {
        portfolio.ratings[existingRatingIndex].value = value;
      } else {
        portfolio.ratings.push({ userId, value });
      }

      this.savePortfolios(portfolios);
      return portfolio;
    }
    return null;
  },

  async toggleFollow(portfolioId: string, followerId: string): Promise<UserPortfolio | null> {
    const portfolios = await this.getPortfolios();
    const portfolio = portfolios.find(p => p.id === portfolioId);

    if (portfolio) {
      if (!portfolio.internalFollowers) portfolio.internalFollowers = [];

      const index = portfolio.internalFollowers.indexOf(followerId);
      if (index === -1) {
        portfolio.internalFollowers.push(followerId);
      } else {
        portfolio.internalFollowers.splice(index, 1);
      }

      this.savePortfolios(portfolios);
      return portfolio;
    }
    return null;
  }
};
