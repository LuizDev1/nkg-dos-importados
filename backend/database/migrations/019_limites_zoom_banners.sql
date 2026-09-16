UPDATE banners
SET zoom = LEAST(150, GREATEST(50, zoom)),
    zoom_2 = LEAST(150, GREATEST(50, zoom_2));
