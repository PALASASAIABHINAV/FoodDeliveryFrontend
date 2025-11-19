import React from 'react'
import { useUserStore } from '../store/useAuthStore';
import OwnerDashboard from '../components/owenr/OwnerDashboard';
import UserDashboard from '../components/user/UserDashboard';
import DeliveryBoyDashboard from '../components/deliveryBoy/DeliveryBoyDashboard';
import AdminLayout from '../admin/AdminLayout';

const Home = () => {
    const {user, loading} = useUserStore();
    
    if(loading) return <p>Loading...</p>;
    
    return (
        <div>
            {user.role === "owner" && <OwnerDashboard/>}
            {user.role === "user" && <UserDashboard/>}
            {user.role === "deliveryBoy" && <DeliveryBoyDashboard/>}
            {user.role === "admin" && <AdminLayout/>}
        </div>
    )
}

export default Home