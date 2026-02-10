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
    const { data: updatedReq, error: reqError } = await supabase
        .from('winnings_requests')
        .update({ status: 'approved' })
        .eq('id', requestId)
        .select();

    if (reqError) throw reqError;
    if (!updatedReq || updatedReq.length === 0) {
        throw new Error("Update failed: Permission denied or request not found.");
    }

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
    const { data, error } = await supabase
        .from('winnings_requests')
        .update({ status: 'denied' })
        .eq('id', requestId)
        .select();

    if (error) throw error;
    if (!data || data.length === 0) {
        throw new Error("Update failed: Permission denied or request not found.");
    }
};

// Link a golfer profile to a social account
export const linkGolferToSocial = async (golferId, email, userId) => {
    console.log(`DB: Linking golfer ${golferId} to user ${userId}...`);
    const { data, error } = await supabase
        .from('golfers')
        .update({
            supabase_id: userId
        })
        .eq('id', golferId)
        .select();

    if (error) {
        console.error("DB: Link Error:", error);
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error("No golfer found with ID " + golferId + " or permission denied.");
    }

    console.log("DB: Link record updated successfully.");
    return data;
};

// Initial sync to upload local golfer data to the DB if empty
export const syncInitialData = async (initialGolfers) => {
    console.log("DB: Starting data sync for", initialGolfers.length, "golfers...");
    try {
        const syncPromises = initialGolfers.map(async (g) => {
            const { data: existing, error: fetchError } = await supabase
                .from('golfers')
                .select('id')
                .eq('id', g.id)
                .maybeSingle();

            if (fetchError) {
                console.warn(`DB: Error checking golfer ${g.name}:`, fetchError);
                return;
            }

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
                        is_admin: g.name === 'Phil' || g.name === 'Bully'
                    }]);
            } else {
                // Always update assets to ensure they match data.js definitions
                await supabase
                    .from('golfers')
                    .update({
                        image_url: g.image,
                        photo_url: g.photo || '',
                        is_admin: g.name === 'Phil' || g.name === 'Bully'
                    })
                    .eq('id', g.id);
            }
        });

        await Promise.all(syncPromises);
        console.log("DB: Data sync complete.");
    } catch (err) {
        console.error("DB: Sync failed:", err);
        // Don't throw, let the app try to load anyway
    }
};
