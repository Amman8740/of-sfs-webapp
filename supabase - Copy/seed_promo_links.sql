-- Insert dummy promo links data for user: 32c844ce-a279-4f87-adfc-9e8ca06bc459

-- Insert dummy promo links
INSERT INTO promo_links (
    user_id,
    model,
    promo_name,
    fans_gained,
    renewals,
    revenue_from_renewals,
    spend_to_sub_ratio,
    roi,
    status,
    url,
    description,
    created_at
) VALUES 
(
    '32c844ce-a279-4f87-adfc-9e8ca06bc459', -- Your actual user ID
    'Elena Petrova',
    'July free trial blast',
    320,
    94,
    485.00,
    0.50,
    216.00,
    'Active',
    'https://www.onlufans.com/watch?v=8of5w7RgcTc&list=PLrAXtmRdnEQy6nuLMOVu8L8Q8Q8Q8Q8Q8',
    'Summer promotion campaign for new subscribers',
    '2024-06-22 10:30:00+00'
),
(
    '32c844ce-a279-4f87-adfc-9e8ca06bc459', -- Replace with your actual user ID
    'John Doe',
    'Summer Special Campaign',
    156,
    67,
    335.00,
    0.75,
    180.00,
    'Active',
    'https://www.onlufans.com/summer-special-2024',
    'Special summer promotion with exclusive content',
    '2024-01-20 14:15:00+00'
),
(
    '32c844ce-a279-4f87-adfc-9e8ca06bc459', -- Replace with your actual user ID
    'Jane Smith',
    'New Year Promotion',
    89,
    23,
    115.00,
    1.20,
    95.00,
    'Paused',
    'https://www.onlufans.com/new-year-2024',
    'New Year special offer campaign',
    '2024-01-10 09:45:00+00'
),
(
    '32c844ce-a279-4f87-adfc-9e8ca06bc459', -- Replace with your actual user ID
    'Alex Johnson',
    'Black Friday Blast',
    450,
    180,
    900.00,
    0.40,
    300.00,
    'Active',
    'https://www.onlufans.com/black-friday-2024',
    'Black Friday mega promotion with huge discounts',
    '2024-11-24 00:00:00+00'
),
(
    '32c844ce-a279-4f87-adfc-9e8ca06bc459', -- Replace with your actual user ID
    'Maria Garcia',
    'Valentine Special',
    78,
    34,
    170.00,
    0.90,
    120.00,
    'Inactive',
    'https://www.onlufans.com/valentine-2024',
    'Valentine Day special romantic content promotion',
    '2024-02-14 12:00:00+00'
);

-- Query to get your user ID (run this first to get your actual user ID)
-- SELECT id, email FROM auth.users;
