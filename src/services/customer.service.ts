import { prisma } from '@/lib/db';

export interface CreateCustomerInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  passwordHash: string;
}

export const CustomerService = {
  /**
   * Find customer by email with active status
   */
  async findByEmail(email: string) {
    try {
      return await prisma.customer.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          auth: true,
          addresses: true,
        },
      });
    } catch (err) {
      return null;
    }
  },

  /**
   * Create new customer with security auth credentials
   */
  async createCustomer(input: CreateCustomerInput) {
    return await prisma.customer.create({
      data: {
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        auth: {
          create: {
            passwordHash: input.passwordHash,
          },
        },
      },
      include: {
        auth: true,
      },
    });
  },

  /**
   * Add new address to customer profile
   */
  async addAddress(customerId: string, addressData: {
    label?: string;
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    isDefaultShip?: boolean;
    isDefaultBill?: boolean;
  }) {
    return await prisma.customerAddress.create({
      data: {
        customerId,
        ...addressData,
      },
    });
  },
};
