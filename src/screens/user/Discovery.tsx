import React from 'react';
import './DiscoverDashboard.css';

const DiscoverDashboard = () => {
    const products = [
        {
            id: 1,
            title: 'Portable Mini Air Cooler',
            category: 'Home',
            margin: '65%',
            profit: '519',
            cost: '280',
            sell: '799',
            sales: '3.6k+',
            competition: 'Low',
            demand: '94',
            imageClass: 'img-cooler'
        },
        {
            id: 2,
            title: 'Resistance Bands Set (5 Levels)',
            category: 'Fitness',
            margin: '70%',
            profit: '384',
            cost: '165',
            sell: '549',
            sales: '3.1k+',
            competition: 'Low',
            demand: '91',
            imageClass: 'img-fitness'
        },
        {
            id: 3,
            title: 'Waterproof Eyebrow Stamp Kit',
            category: 'Beauty',
            margin: '74%',
            profit: '260',
            cost: '89',
            sell: '349',
            sales: '4.2k+',
            competition: 'Low',
            demand: '88',
            imageClass: 'img-beauty'
        }
    ];

    return (
        <div style={{padding:10}}>
            {/* Hero Banner */}
            <div className="hero-banner rounded-4 p-5 mb-2 text-white position-relative overflow-hidden">
                <div className="position-relative z-1">
                    <div className='row'>
                        <div className='col-md-8'>
                            <div className="d-flex text-orange align-items-center gap-2 mb-3">
                                <span className="dot rounded-circle" style={{ backgroundColor: '#F5891E' }}></span>
                                <span className=" fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>Live Product Intelligence</span>
                            </div>
                            <h1 className="display-5 fw-bold text-white mb-1">Find Your Next</h1>
                            <h1 className="display-5 text-success fw-bold  mb-3">Winning Product</h1>

                        </div>
                        <div className='col-md-4'>
                                <p className="text-white-50 mb-4" style={{ maxWidth: '500px' }}>
                                    Every product is scored by demand, profit margin, competition level & return rate — so you only list products built to sell.
                                </p>
                            <div className="d-flex gap-3">
                                <div className="stat-badge d-flex align-items-center gap-2 px-3 py-2 rounded-3 border border-secondary border-opacity-25">
                                    <div className="icon-box text-success"><i className="bi bi-bullseye"></i></div>
                                    <div>
                                        <div className="text-white-50" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Avg. Profit Margin</div>
                                        <div className="text-success fw-bold">69%</div>
                                    </div>
                                </div>
                                <div className="stat-badge d-flex align-items-center gap-2 px-3 py-2 rounded-3 border border-secondary border-opacity-25">
                                    <div className="icon-box text-info"><i className="bi bi-check-circle"></i></div>
                                    <div>
                                        <div className="text-white-50" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Low Competition</div>
                                        <div className="text-info fw-bold">60% of catalog</div>
                                    </div>
                                </div>
                                <div className="stat-badge d-flex align-items-center gap-2 px-3 py-2 rounded-3 border border-secondary border-opacity-25">
                                    <div className="icon-box text-warning"><i className="bi bi-lightning-fill"></i></div>
                                    <div>
                                        <div className="text-white-50" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Fast Shipping</div>
                                        <div className="text-warning fw-bold">2-5 days</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="search-products input-group w-50 shadow-sm rounded">
                    <span className="input-group-text bg-white border-0 text-muted"><i className="bi bi-search"></i></span>
                    <input type="text" className="form-control bg-white border-0 shadow-none py-2" placeholder="Search products..." />
                </div>

                <div className="btn-group shadow-sm bg-white rounded p-1" role="group">
                    <button className="btn btn-white border-0 text-muted px-3"><i className="bi bi-funnel me-1"></i></button>
                    <button className="btn btn-orange rounded text-white px-3 fw-medium">Demand</button>
                    <button className="btn btn-white border-0 text-muted px-3 fw-medium">Profit</button>
                    <button className="btn btn-white border-0 text-muted px-3 fw-medium">Sales</button>
                </div>
            </div>

            {/* Category Pills */}
            <div className="category-pills d-flex gap-2 mb-4 overflow-auto pb-2">
                <button className="btn btn-orange rounded-pill px-4 fw-medium">All</button>
                <button className="btn btn-white shadow-sm border rounded-pill px-4 text-dark fw-medium">Home</button>
                <button className="btn btn-white shadow-sm border rounded-pill px-4 text-dark fw-medium">Beauty</button>
                <button className="btn btn-white shadow-sm border rounded-pill px-4 text-dark fw-medium">Electronics</button>
                <button className="btn btn-white shadow-sm border rounded-pill px-4 text-dark fw-medium">Kitchen</button>
                <button className="btn btn-white shadow-sm border rounded-pill px-4 text-dark fw-medium">Fitness</button>
                <button className="btn btn-white shadow-sm border rounded-pill px-4 text-dark fw-medium">Fashion</button>
                <button className="btn btn-white shadow-sm border rounded-pill px-4 text-dark fw-medium">Kids</button>
            </div>

            {/* Product Grid Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-medium text-dark"><span className="fw-bold">6</span> products available to list</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}><i className="bi bi-check-circle text-success me-1"></i> All products quality-checked</div>
            </div>

            {/* Product Cards */}
            <div className="row g-4 pb-5">
                {products.map(product => (
                    <div className="col-12 col-md-6 col-lg-4" key={product.id}>
                        <div className="card product-card border-0 shadow-sm h-100 rounded-4 overflow-hidden bg-white">

                            {/* Image Section */}
                            <div className={`card-img-top position-relative placeholder-img ${product.imageClass}`}>
                                <div className="position-absolute top-0 start-0 m-3 badge bg-orange text-white px-2 py-1 shadow-sm d-flex align-items-center gap-1">
                                    <i className="bi bi-fire"></i> Bestseller
                                </div>
                                <button className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                    <i className="bi bi-bookmark text-muted"></i>
                                </button>
                                <div className="position-absolute bottom-0 start-0 m-3 badge bg-dark bg-opacity-75 text-white px-2 py-1 d-flex align-items-center gap-1">
                                    <i className="bi bi-graph-up-arrow text-success"></i> Demand {product.demand}/100
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="card-body p-4 d-flex flex-column">
                                <h6 className="fw-bold mb-1 text-truncate">{product.title}</h6>
                                <small className="text-muted d-block mb-3">{product.category}</small>

                                {/* Profit Box */}
                                <div className="profit-box bg-success-light rounded-3 p-3 mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-success fw-bold" style={{ fontSize: '0.7rem' }}>YOUR PROFIT / SALE</small>
                                        <span className="badge bg-success bg-opacity-25 text-success">{product.margin} margin</span>
                                    </div>
                                    <div className="d-flex align-items-baseline gap-1 mb-1">
                                        <h4 className="fw-bold text-success mb-0">₹{product.profit}</h4>
                                        <small className="text-success">per order</small>
                                    </div>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        ₹ Cost: ₹{product.cost} • Sell at: ₹{product.sell}
                                    </small>
                                </div>

                                {/* Footer Stats */}
                                <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Monthly Sales</small>
                                        <span className="fw-bold fs-6">{product.sales}</span>
                                    </div>
                                    <div className="text-end">
                                        <small className="text-muted d-block" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Competition</small>
                                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">{product.competition}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default DiscoverDashboard;