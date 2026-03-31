import { dbInstance } from '../database/db.js';
import { Session } from '../security/crypto.js';

export const InstallmentAPI = {
  // Simple flat interest rate calculation for simulation
  // e.g. 15% flat per year
  calculate(price, downPayment, months) {
    const principal = price - downPayment;
    if (principal <= 0) return { error: 'Down payment must be less than car price.' };
    
    const years = months / 12;
    const interestRate = 0.15; // 15% interest
    const totalInterest = principal * interestRate * years;
    const totalPayable = principal + totalInterest;
    const monthlyPayment = totalPayable / months;

    return {
      principal,
      totalInterest,
      totalPayable,
      monthlyPayment
    };
  },

  async apply(carId, carPrice, downPayment, months) {
    const session = Session.getSession();
    if (!session) throw new Error("Must be logged in to apply");

    const specs = this.calculate(carPrice, downPayment, months);
    if (specs.error) throw new Error(specs.error);

    const application = {
      userId: session.userId,
      userName: session.name,
      carId,
      carPrice,
      downPayment,
      months,
      ...specs,
      status: 'pending',
      date: new Date().toISOString()
    };

    await dbInstance.insert('installments', application);
    return "Installment application submitted successfully. We will contact you soon.";
  },

  async getUserApplications() {
    const session = Session.getSession();
    if (!session) return [];
    
    const all = await dbInstance.getByIndex('installments', 'userId', session.userId);
    return all;
  },

  async getAllApplications() {
    return await dbInstance.getAll('installments');
  },

  async updateStatus(appId, newStatus) {
    const session = Session.getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");
    
    const app = await dbInstance.getById('installments', appId);
    if (app) {
      app.status = newStatus;
      await dbInstance.update('installments', app);
    }
  }
};
