import { AccessType } from '@prisma/client';

export interface PricingPlan {
    id: string;
    title: string;
    description: string;
    price: number;
    accessType: AccessType;
    features: string[];
    popular?: boolean;
    badge?: string;
    endDate: Date;
    couponCode?: Record<string, any>[];
}

export const pricingPlans: PricingPlan[] = [
    {
        id: 'starter',
        title: 'Starter Plan',
        description: 'Perfect for beginners getting started with crypto flashing',
        price: 300,
        accessType: AccessType.SMALL,
        features: [
            'Up to $15,000 flash limit per transaction',
            '24-hour validity period',
            'Basic mining server access',
            '48-hour transaction processing',
            'Mobile app access',
            'Transaction history tracking'
        ],
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        couponCode: [{ code: 'STARTER30', discount: 0.30 }]
    },
    {
        id: 'professional',
        title: 'Professional Plan',
        description: 'Most popular choice for serious crypto traders and professionals',
        price: 750,
        accessType: AccessType.MEDIUM,
        popular: true,
        badge: 'Most Popular',
        features: [
            'Up to $25,000 flash limit per transaction',
            '7-day validity period',
            'Premium mining server access',
            'Advanced mobile app features',
            'Detailed transaction analytics',
            'Custom wallet integration'
        ],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        couponCode: [{ code: 'PROFESSIONAL40', discount: 0.40 }]
    },
    {
        id: 'enterprise',
        title: 'Enterprise Plan',
        description: 'Advanced features for high-volume traders and institutions',
        price: 2500,
        accessType: AccessType.LARGE,
        features: [
            'Up to $75,000 flash limit per transaction',
            'Instant transaction processing',
            '30-day validity period',
            'Enterprise flashing server cluster',
            'Advanced analytics & reporting',
            'Dedicated account manager'
        ],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        couponCode: [{ code: 'ENTERPRISE50', discount: 0.50 }]
    },
    {
        id: 'institutional',
        title: 'Institutional Plan',
        description: 'Ultimate solution for large institutions and enterprise clients',
        price: 7000,
        accessType: AccessType.XLARGE,
        badge: 'Premium',
        features: [
            'Unlimited flash transaction limits',
            'Real-time transaction processing',
            'Private flashing server infrastructure',
            'Advanced compliance suite',
            'Legal & regulatory support',
            'On-premise deployment option'
        ],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        couponCode: [{ code: 'INSTITUTIONAL68', discount: 0.68 }]
    }
];

export const getPlanByAccessType = (accessType: AccessType): PricingPlan | undefined => {
    return pricingPlans.find(plan => plan.accessType === accessType);
};

export const getPlanById = (id: string): PricingPlan | undefined => {
    return pricingPlans.find(plan => plan.id === id);
};

export const getPlanByPrice = (price: number): PricingPlan | undefined => {
    return pricingPlans.find(plan => plan.price === price);
};
