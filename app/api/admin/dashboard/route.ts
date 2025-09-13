import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function GET(_request: NextRequest) {
    try {
        // Verify admin authentication
        const currentUser = await getCurrentUser();

        const user = await prisma.user.findUnique({
            where: { id: currentUser?.id },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Fetch all data using Prisma's native functions sequentially for better reliability
        // Users with all related data
        const users = await prisma.user.findMany({
            include: {
                payments: true,
                transactions: true,
                subscription: true,
                Balance: true,
                sponsors: {
                    include: {
                        sponsee: {
                            select: { username: true, email: true }
                        }
                    }
                },
                sponsee: {
                    include: {
                        sponsor: {
                            select: { username: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // All payments with user info
        const payments = await prisma.payment.findMany({
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        location: true,
                        currentPlan: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // All transactions with user info
        const transactions = await prisma.transaction.findMany({
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        location: true,
                        currentPlan: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // All subscriptions with user info
        const subscriptions = await prisma.subscription.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        location: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // All plans
        const plans = await prisma.plans.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // All balances with user info
        const balances = await prisma.balance.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        location: true
                    }
                },
                sponsorship: {
                    include: {
                        sponsor: {
                            select: { username: true, email: true }
                        },
                        sponsee: {
                            select: { username: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // All coupons
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // All sponsorships with full user info
        const sponsorships = await prisma.sponsorship.findMany({
            include: {
                sponsor: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        location: true,
                        currentPlan: true
                    }
                },
                sponsee: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        location: true,
                        currentPlan: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Parse location data for users
        const processedUsers = users.map(user => ({
            ...user,
            location: user.location ? (() => {
                try {
                    return JSON.parse(user.location);
                } catch {
                    return { country: 'Unknown', city: 'Unknown' };
                }
            })() : { country: 'Unknown', city: 'Unknown' }
        }));

        // Parse location data for other entities that have user info
        const processedPayments = payments.map(payment => ({
            ...payment,
            User: {
                ...payment.User,
                location: payment.User.location ? (() => {
                    try {
                        return JSON.parse(payment.User.location);
                    } catch {
                        return { country: 'Unknown', city: 'Unknown' };
                    }
                })() : { country: 'Unknown', city: 'Unknown' }
            }
        }));

        const processedTransactions = transactions.map(transaction => ({
            ...transaction,
            User: {
                ...transaction.User,
                location: transaction.User.location ? (() => {
                    try {
                        return JSON.parse(transaction.User.location);
                    } catch {
                        return { country: 'Unknown', city: 'Unknown' };
                    }
                })() : { country: 'Unknown', city: 'Unknown' }
            }
        }));

        const processedSubscriptions = subscriptions.map(subscription => ({
            ...subscription,
            user: {
                ...subscription.user,
                location: subscription.user.location ? (() => {
                    try {
                        return JSON.parse(subscription.user.location);
                    } catch {
                        return { country: 'Unknown', city: 'Unknown' };
                    }
                })() : { country: 'Unknown', city: 'Unknown' }
            }
        }));

        const processedBalances = balances.map(balance => ({
            ...balance,
            user: {
                ...balance.user,
                location: balance.user.location ? (() => {
                    try {
                        return JSON.parse(balance.user.location);
                    } catch {
                        return { country: 'Unknown', city: 'Unknown' };
                    }
                })() : { country: 'Unknown', city: 'Unknown' }
            }
        }));

        const processedSponsorships = sponsorships.map(sponsorship => ({
            ...sponsorship,
            sponsor: {
                ...sponsorship.sponsor,
                location: sponsorship.sponsor.location ? (() => {
                    try {
                        return JSON.parse(sponsorship.sponsor.location);
                    } catch {
                        return { country: 'Unknown', city: 'Unknown' };
                    }
                })() : { country: 'Unknown', city: 'Unknown' }
            },
            sponsee: {
                ...sponsorship.sponsee,
                location: sponsorship.sponsee.location ? (() => {
                    try {
                        return JSON.parse(sponsorship.sponsee.location);
                    } catch {
                        return { country: 'Unknown', city: 'Unknown' };
                    }
                })() : { country: 'Unknown', city: 'Unknown' }
            }
        }));

        return NextResponse.json({
            users: processedUsers,
            payments: processedPayments,
            transactions: processedTransactions,
            subscriptions: processedSubscriptions,
            plans,
            balances: processedBalances,
            coupons,
            sponsorships: processedSponsorships
        });

    } catch (error) {
        console.error('Error fetching admin data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin data' },
            { status: 500 }
        );
    }
}

// CRUD operations for specific entities using Prisma transactions
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const currentUser = await getCurrentUser();

        const user = await prisma.user.findUnique({
            where: { id: currentUser?.id },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { action, entity, data, id } = await request.json();

        // Use Prisma transaction for complex operations
        const result = await prisma.$transaction(async (tx) => {
            switch (action) {
                case 'create':
                    return await handleCreate(tx, entity, data);
                case 'update':
                    return await handleUpdate(tx, entity, id, data);
                case 'delete':
                    return await handleDelete(tx, entity, id);
                default:
                    throw new Error('Invalid action');
            }
        });

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error('Error in admin operation:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Operation failed' },
            { status: 500 }
        );
    }
}

async function handleCreate(tx: any, entity: string, data: any) {
    switch (entity) {
        case 'plan':
            return await tx.plans.create({ data });
        case 'coupon':
            return await tx.coupon.create({ data });
        case 'user':
            // When creating a user, also create their balance record
            const newUser = await tx.user.create({ data });
            await tx.balance.create({
                data: {
                    userId: newUser.id,
                    amount: 0,
                    currency: 'USD'
                }
            });
            return newUser;
        case 'subscription':
            return await tx.subscription.create({ data });
        default:
            throw new Error(`Create operation not supported for ${entity}`);
    }
}

async function handleUpdate(tx: any, entity: string, id: string, data: any) {
    // Filter data based on entity type to remove fields that shouldn't be updated
    const filteredData = filterDataForEntity(data, entity);
    
    switch (entity) {
        case 'user':
            return await tx.user.update({ where: { id }, data: {...filteredData, location: JSON.stringify(filteredData.location) } });
        case 'payment':
            return await tx.payment.update({ where: { id }, data: filteredData });
        case 'transaction':
            return await tx.transaction.update({ where: { id }, data: filteredData });
        case 'subscription':
            return await tx.subscription.update({ where: { id }, data: filteredData });
        case 'plan':
            return await tx.plans.update({ where: { id }, data: filteredData });
        case 'coupon':
            return await tx.coupon.update({ where: { id }, data: filteredData });
        case 'balance':
            return await tx.balance.update({ where: { id }, data: filteredData });
        case 'sponsorship':
            return await tx.sponsorship.update({ where: { id }, data: filteredData });
        default:
            throw new Error(`Update operation not supported for ${entity}`);
    }
}

function filterDataForEntity(data: any, entity: string) {
    // Common fields to exclude for all entities
    const { id: _id,  createdAt: _createdAt,  updatedAt: _updatedAt, user: _user, User: _User, sponsee: _sponsee, sponsors: _sponsors, ...baseData } = data;

    switch (entity) {
        case 'user':
            // For user, also exclude location fields
            const { ip: _ip, payments: _payments, transactions: _transactions, subscription: _subscription, ...userData } = baseData;
            return userData;
        case 'balance':
            // For balance, also exclude userId and relationship fields
            const { userId: _userId, sponsorship: _sponsorship,  ...balanceData } = baseData;
            return balanceData;
        case 'payment':
            // For payment, exclude userId (use relation updates if needed)
            const { userId: _paymentUserId, ...paymentData } = baseData;
            return paymentData;
        case 'transaction':
            // For transaction, exclude userId
            const { userId: _transactionUserId, ...transactionData } = baseData;
            return transactionData;
        case 'subscription':
            // For subscription, exclude userId
            const { userId: _subscriptionUserId, ...subscriptionData } = baseData;
            return subscriptionData;
        case 'sponsorship':
            // For sponsorship, exclude nested user objects
            const { sponsor: _sponsor, sponsee: _sponsee, Balance: _Balance, ...sponsorshipData } = baseData;
            return sponsorshipData;
        default:
            return baseData;
    }
}

async function handleDelete(tx: any, entity: string, id: string) {
    switch (entity) {
        case 'user':
            // Delete related records first due to foreign key constraints
            await tx.balance.deleteMany({ where: { userId: id } });
            await tx.payment.deleteMany({ where: { userId: id } });
            await tx.transaction.deleteMany({ where: { userId: id } });
            await tx.subscription.deleteMany({ where: { userId: id } });
            await tx.sponsorship.deleteMany({
                where: {
                    OR: [
                        { sponsorId: id },
                        { sponseeId: id }
                    ]
                }
            });
            return await tx.user.delete({ where: { id } });
        case 'payment':
            return await tx.payment.delete({ where: { id } });
        case 'transaction':
            return await tx.transaction.delete({ where: { id } });
        case 'subscription':
            return await tx.subscription.delete({ where: { id } });
        case 'plan':
            return await tx.plans.delete({ where: { id } });
        case 'coupon':
            return await tx.coupon.delete({ where: { id } });
        case 'balance':
            return await tx.balance.delete({ where: { id } });
        case 'sponsorship':
            return await tx.sponsorship.delete({ where: { id } });
        default:
            throw new Error(`Delete operation not supported for ${entity}`);
    }
}

// Bulk operations using Prisma's native bulk functions
export async function PATCH(request: NextRequest) {
    try {
        // Verify admin authentication
        const currentUser = await getCurrentUser();

        const user = await prisma.user.findUnique({
            where: { id: currentUser?.id },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { action, entity, data, ids } = await request.json();

        let result;

        // Use Prisma's bulk operations
        switch (action) {
            case 'bulkUpdate':
                result = await handleBulkUpdate(entity, ids, data);
                break;
            case 'bulkDelete':
                result = await handleBulkDelete(entity, ids);
                break;
            case 'bulkCreate':
                result = await handleBulkCreate(entity, data);
                break;
            default:
                throw new Error('Invalid bulk action');
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error('Error in bulk admin operation:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Bulk operation failed' },
            { status: 500 }
        );
    }
}

async function handleBulkCreate(entity: string, data: any[]) {
    switch (entity) {
        case 'plan':
            return await prisma.plans.createMany({ data });
        case 'coupon':
            return await prisma.coupon.createMany({ data });
        case 'user':
            // For users, we need individual creates to handle balance creation
            const users = [];
            for (const userData of data) {
                const newUser = await prisma.user.create({ data: userData });
                await prisma.balance.create({
                    data: {
                        userId: newUser.id,
                        amount: 0,
                        currency: 'USD'
                    }
                });
                users.push(newUser);
            }
            return users;
        default:
            throw new Error(`Bulk create operation not supported for ${entity}`);
    }
}

async function handleBulkUpdate(entity: string, ids: string[], data: any) {
    switch (entity) {
        case 'user':
            return await prisma.user.updateMany({
                where: { id: { in: ids } },
                data
            });
        case 'payment':
            return await prisma.payment.updateMany({
                where: { id: { in: ids } },
                data
            });
        case 'transaction':
            return await prisma.transaction.updateMany({
                where: { id: { in: ids } },
                data
            });
        case 'subscription':
            return await prisma.subscription.updateMany({
                where: { id: { in: ids } },
                data
            });
        case 'plan':
            return await prisma.plans.updateMany({
                where: { id: { in: ids } },
                data
            });
        case 'coupon':
            return await prisma.coupon.updateMany({
                where: { id: { in: ids } },
                data
            });
        case 'sponsorship':
            return await prisma.sponsorship.updateMany({
                where: { id: { in: ids } },
                data
            });
        default:
            throw new Error(`Bulk update operation not supported for ${entity}`);
    }
}

async function handleBulkDelete(entity: string, ids: string[]) {
    // Use transaction for complex bulk deletions
    return await prisma.$transaction(async (tx) => {
        switch (entity) {
            case 'user':
                // Delete related records first
                await tx.balance.deleteMany({ where: { userId: { in: ids } } });
                await tx.payment.deleteMany({ where: { userId: { in: ids } } });
                await tx.transaction.deleteMany({ where: { userId: { in: ids } } });
                await tx.subscription.deleteMany({ where: { userId: { in: ids } } });
                await tx.sponsorship.deleteMany({
                    where: {
                        OR: [
                            { sponsorId: { in: ids } },
                            { sponseeId: { in: ids } }
                        ]
                    }
                });
                return await tx.user.deleteMany({ where: { id: { in: ids } } });
            case 'payment':
                return await tx.payment.deleteMany({ where: { id: { in: ids } } });
            case 'transaction':
                return await tx.transaction.deleteMany({ where: { id: { in: ids } } });
            case 'subscription':
                return await tx.subscription.deleteMany({ where: { id: { in: ids } } });
            case 'plan':
                return await tx.plans.deleteMany({ where: { id: { in: ids } } });
            case 'coupon':
                return await tx.coupon.deleteMany({ where: { id: { in: ids } } });
            case 'balance':
                return await tx.balance.deleteMany({ where: { id: { in: ids } } });
            case 'sponsorship':
                return await tx.sponsorship.deleteMany({ where: { id: { in: ids } } });
            default:
                throw new Error(`Bulk delete operation not supported for ${entity}`);
        }
    });
}
