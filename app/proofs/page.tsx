
import React from 'react';
import { getCurrentUser } from '../utils/jwt';
import PageComponent from './PageCopnent';

export default async function ProofsPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
        return <div>You do not have permission to view this page.</div>;
    }


    return (
        <PageComponent />
    );
}