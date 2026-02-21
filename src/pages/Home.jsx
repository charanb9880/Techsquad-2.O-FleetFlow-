import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Shield, Zap, Wrench,
    Map as MapIcon, BarChart3, TrendingUp,
    MousePointer2, ChevronRight, ChevronDown, Navigation
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchVehicleLiveLocations } from '../data/mapMockData';

// Reusing Icon Logic for Homepage Map
const createHomeIcon = (color) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 40 48">
        <path d="M20 4 C11.16 4 4 11.16 4 20 C4 31.5 20 44 20 44 S36 31.5 36 20 C36 11.16 28.84 4 20 4Z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="20" cy="19" r="7" fill="#fff" opacity="0.9"/>
    </svg>`;
    return L.divIcon({
        html: svg, className: 'custom-marker-icon',
        iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -38],
    });
};

const HOME_ICONS = {
    available: createHomeIcon('#ef4444'),
    on_trip: createHomeIcon('#16a34a'),
    accident: createHomeIcon('#d97706'),
};

const FEATURE_DATA = [
    {
        id: 'dispatch',
        title: 'Smart Dispatch System',
        description: 'Optimize route planning and vehicle assignment with AI-driven logic. Reduce idle time and increase delivery efficiency across your entire fleet.',
        route: '/trips',
        label: 'View Trips'
    },
    {
        id: 'compliance',
        title: 'Driver Compliance & Safety',
        description: 'Monitor driver behavior, enforce safety protocols, and ensure regulatory compliance in real-time. Automated alerts for violations.',
        route: '/drivers',
        label: 'Manage Drivers'
    },
    {
        id: 'maintenance',
        title: 'Predictive Maintenance',
        description: 'Stay ahead of breakdowns. Our system predicts maintenance needs based on vehicle health data and usage patterns.',
        route: '/maintenance',
        label: 'Check Status'
    }
];

export default function Home() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [activeVideo, setActiveVideo] = useState(1);
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await fetchVehicleLiveLocations();
                setVehicles(data);
            } catch (e) { console.error(e); }
        };
        loadInitialData();

        const handleScroll = () => {
            const scrollPos = window.scrollY;
            setScrolled(scrollPos > 50);

            if (scrollPos > window.innerHeight * 1.5) {
                setActiveVideo(2);
            } else {
                setActiveVideo(1);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page dark-theme">
            {/* Background Video Containers */}
            <div className="bg-video-wrapper">
                <video
                    autoPlay muted loop playsInline
                    className={`bg-video-layer ${activeVideo === 1 ? 'active' : 'inactive'}`}
                >
                    <source src="/WhatsApp Video 2026-02-21 at 13.24.42.mp4" type="video/mp4" />
                </video>
                <video
                    autoPlay muted loop playsInline
                    className={`bg-video-layer ${activeVideo === 2 ? 'active' : 'inactive'}`}
                >
                    <source src="/WhatsApp Video 2026-02-21 at 13.25.44.mp4" type="video/mp4" />
                </video>
                <div className="bg-video-overlay"></div>
            </div>

            {/* Background Grain Texture */}
            <div className="bg-grain"></div>

            {/* 1️⃣ HERO SECTION */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="reveal-up">Rule-Driven <span className="gradient-text">Fleet Intelligence</span></h1>
                    <p className="reveal-up delay-1">
                        Optimize fleet lifecycle, enforce compliance, and drive financial performance with enterprise-grade precision.
                    </p>
                    <div className="hero-actions reveal-up delay-2">
                        <button className="btn-gradient btn-lg flex items-center justify-center gap-2" onClick={() => navigate('/dashboard')}>
                            Enter Dashboard <ChevronRight className="w-5 h-5 icon-right" />
                        </button>
                        <button className="btn-outline btn-lg flex items-center justify-center gap-2" onClick={() => {
                            document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
                        }}>
                            Explore Features <ChevronDown className="w-5 h-5 icon-down" />
                        </button>
                    </div>
                </div>

                <div className="scroll-indicator">
                    <ChevronDown className="animate-bounce w-8 h-8 opacity-50" />
                </div>
            </section>

            {/* 2️⃣ INTRODUCTION BLOCK */}
            <section id="intro" className="section-padding">
                <div className="container">
                    <div className="intro-card glass-card reveal-up">
                        <div className="gradient-top-border"></div>
                        <div className="card-content text-center">
                            <h2 className="mb-6">The Future of Fleet Management</h2>
                            <p className="max-w-3xl mx-auto text-lg text-secondary mb-12">
                                FleetFlow is a sophisticated, single-pane-of-glass solution designed for modern logistics enterprises.
                                We combine real-time data with predictive intelligence to transform how you move, manage, and scale.
                            </p>
                            <div className="grid-3">
                                <div className="feature-mini">
                                    <div className="icon-wrapper-gradient mb-4">
                                        <Shield className="w-8 h-8" />
                                    </div>
                                    <h3>Secure & Compliant</h3>
                                    <p className="text-sm text-tertiary">Enterprise-grade security and automated compliance monitoring.</p>
                                </div>
                                <div className="feature-mini">
                                    <div className="icon-wrapper-gradient mb-4">
                                        <Zap className="w-8 h-8" />
                                    </div>
                                    <h3>Real-Time Speed</h3>
                                    <p className="text-sm text-tertiary">Sub-second latency for live tracking and system-wide alerts.</p>
                                </div>
                                <div className="feature-mini">
                                    <div className="icon-wrapper-gradient mb-4">
                                        <BarChart3 className="w-8 h-8" />
                                    </div>
                                    <h3>ROI Focused</h3>
                                    <p className="text-sm text-tertiary">Advanced financial analytics to maximize your operational yield.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3️⃣ FEATURE SECTIONS */}
            {FEATURE_DATA.map((feature, idx) => (
                <section key={feature.id} className="section-padding overflow-hidden">
                    <div className="container">
                        <div className={`feature-block ${idx % 2 !== 0 ? 'reverse' : ''}`}>
                            <div className="feature-media reveal-side-left">
                                <div className="media-container glass-card no-padding overflow-hidden">
                                    <div className="media-placeholder dark-matte flex items-center justify-center h-64 lg:h-80">
                                        <Zap className="w-16 h-16 text-primary opacity-20 animate-pulse" />
                                    </div>
                                    <div className="accent-strip"></div>
                                </div>
                            </div>
                            <div className="feature-text reveal-side-right">
                                <h2 className="mb-6">{feature.title}</h2>
                                <p className="text-lg text-secondary mb-8">{feature.description}</p>
                                <div className="feature-details space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-gradient"></div>
                                        <span className="text-sm font-medium">Enterprise Integration</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-gradient"></div>
                                        <span className="text-sm font-medium">Predictive Logic Engines</span>
                                    </div>
                                </div>
                                <button className="btn-primary" onClick={() => navigate(feature.route)}>
                                    {feature.label} <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* 4️⃣ MAP / VISUAL SECTION */}
            <section className="section-padding">
                <div className="container">
                    <div className="map-visual-container reveal-up">
                        <div className="visual-header">
                            <div className="accent-dot"></div>
                            <span>Live Operational Map Control Center</span>
                        </div>
                        <div className="visual-placeholder">
                            <div className="home-map-wrapper w-full h-full">
                                <MapContainer
                                    center={[20.5937, 78.9629]}
                                    zoom={4}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={false}
                                    zoomControl={false}
                                    dragging={false}
                                >
                                    <TileLayer
                                        attribution='&copy; OpenStreetMap'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {vehicles.map(v => (
                                        <Marker
                                            key={v.vehicle_id}
                                            position={[v.latitude, v.longitude]}
                                            icon={HOME_ICONS[v.status] || HOME_ICONS.available}
                                        >
                                            <Popup>
                                                <div className="text-xs font-bold">{v.name}</div>
                                                <div className="text-[10px] text-gray-500">{v.status}</div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5️⃣ ANALYTICS PREVIEW SECTION */}
            <section className="section-padding">
                <div className="container">
                    <div className="grid-4">
                        <div className="metric-box reveal-up">
                            <span className="metric-value gradient-text">99.8%</span>
                            <span className="metric-label">Uptime Reliability</span>
                        </div>
                        <div className="metric-box reveal-up delay-1">
                            <span className="metric-value gradient-text">14%</span>
                            <span className="metric-label">Avg. Fuel Savings</span>
                        </div>
                        <div className="metric-box reveal-up delay-2">
                            <span className="metric-value gradient-text">2.4M</span>
                            <span className="metric-label">Trips Optimized</span>
                        </div>
                        <div className="metric-box reveal-up delay-3">
                            <span className="metric-value gradient-text">&lt;15m</span>
                            <span className="metric-label">Dispatch Latency</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6️⃣ FINAL CALL TO ACTION */}
            <section className="section-padding pb-32">
                <div className="container">
                    <div className="final-cta-card reveal-up">
                        <div className="cta-background-gradient"></div>
                        <div className="cta-content text-center">
                            <h1 className="mb-8">Transform Fleet Operations with Intelligence</h1>
                            <button className="btn-gradient btn-xl hover-scale" onClick={() => navigate('/dashboard')}>
                                Start Managing Smarter
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimal Footer */}
            <footer className="landing-footer">
                <div className="container text-center py-12 border-t border-primary">
                    <p className="text-tertiary text-sm">© 2026 FleetFlow Intelligence Systems. Built for Scale.</p>
                </div>
            </footer>
        </div>
    );
}
