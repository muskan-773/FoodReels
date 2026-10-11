import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserRegister from '../pages/auth/UserRegister';
import ChooseRegister from '../pages/auth/ChooseRegister';
import UserLogin from '../pages/auth/UserLogin';
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister';
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin';
import Home from '../pages/general/Home';
import Saved from '../pages/general/Saved';
import Search from '../pages/general/Search';
import VideoPlayer from '../pages/general/VideoPlayer';
import BottomNav from '../components/BottomNav';
import TopNav from '../components/TopNav';
import CreateFood from '../pages/food-partner/CreateFood';
import Profile from '../pages/food-partner/Profile';
import UserProfile from '../pages/general/UserProfile';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Auth routes */}
                <Route path="/register" element={<ChooseRegister />} />
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
                <Route path="/food-partner/login" element={<FoodPartnerLogin />} />

                {/* Main discovery routes */}
                <Route path="/" element={<><TopNav /><Home /><BottomNav /></>} />
                <Route path="/saved" element={<><TopNav /><Saved /><BottomNav /></>} />
                <Route path="/search" element={<><TopNav /><Search /><BottomNav /></>} />
                <Route path="/profile" element={<><TopNav /><UserProfile /><BottomNav /></>} />

                {/* Video detail */}
                <Route path="/video/:id" element={<><TopNav /><VideoPlayer /><BottomNav /></>} />

                {/* Food partner routes */}
                <Route path="/create-food" element={<><TopNav /><CreateFood /><BottomNav /></>} />
                <Route path="/food-partner/:id" element={<><TopNav /><Profile /><BottomNav /></>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
