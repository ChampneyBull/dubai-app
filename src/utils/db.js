import { supabase } from './supabase';

export const getGolfers = async () => {
    const { data, error } = await supabase
        .from('golfers')
        .select('*')
        .order('earnings', { ascending: false });

    if (error) throw error;

    return data.map(g => ({
        ...g,
        image: g.image_url,
        photo: g.photo_url
    }));
};

export const getRequests = async () => {
    const { data, error } = await supabase
        .from('winnings_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const submitWinnings = async (request) => {
    const { data, error } = await supabase
        .from('winnings_requests')
        .insert([
            {
                player_id: request.playerId,
                player_name: request.playerName,
                amount: request.amount,
                tournament: request.tournament,
                status: 'pending'
            }
        ]);

    if (error) throw error;
    return data;
};

export const approveWinnings = async (requestId, playerId, amount) => {
    // 1. Update request status
    const { error: reqError } = await supabase
        .from('winnings_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

    if (reqError) throw reqError;

    // 2. Fetch current golfer earnings to be safe
    const { data: golfer, error: fetchError } = await supabase
        .from('golfers')
        .select('earnings')
        .eq('id', playerId)
        .single();

    if (fetchError) throw fetchError;

    // 3. Increment golfer earnings
    const { error: gError } = await supabase
        .from('golfers')
        .update({ earnings: parseFloat(golfer.earnings) + parseFloat(amount) })
        .eq('id', playerId);

    if (gError) throw gError;
};

export const denyWinnings = async (requestId) => {
    const { error } = await supabase
        .from('winnings_requests')
        .update({ status: 'denied' })
        .eq('id', requestId);

    if (error) throw error;
};

// Initial sync to upload local golfer data to the DB if empty
export const syncInitialData = async (initialGolfers) => {
    // Check golfers one by one to fill in blanks
    for (const g of initialGolfers) {
        const { data: existing } = await supabase
            .from('golfers')
            .select('id')
            .eq('id', g.id)
            .maybeSingle();

        if (!existing) {
            await supabase
                .from('golfers')
                .insert([{
                    id: g.id,
                    name: g.name,
                    earnings: g.earnings,
                    image_url: g.image,
                    photo_url: g.photo || '',
                    pin: g.pin,
                    is_admin: g.name === 'Phil'
                }]);
        } else {
            // If Phil already exists but has no image_url, update him
            await supabase
                .from('golfers')
                .update({
                    image_url: g.image,
                    photo_url: g.photo || ''
                })
                .eq('id', g.id)
                .is('image_url', null);
        }
    }
};
