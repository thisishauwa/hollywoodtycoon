-- Fix close_expired_auctions function
-- The function was trying to insert into 'game_events' which doesn't exist
-- The correct table is 'events'

CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS void AS $$
DECLARE
  expired_bid RECORD;
  script_data RECORD;
  user_balance INTEGER;
BEGIN
  -- Find all expired bids that are still active
  FOR expired_bid IN 
    SELECT DISTINCT ON (script_id)
      b.id,
      b.script_id,
      b.user_id,
      b.amount,
      s.title,
      s.genre,
      s.quality,
      s.complexity,
      s.description,
      s.tagline,
      s.required_cast,
      s.tone
    FROM bids b
    JOIN scripts s ON b.script_id = s.id
    WHERE b.is_active = true
      AND b.expires_at <= NOW()
    ORDER BY b.script_id, b.amount DESC, b.created_at ASC
  LOOP
    -- Get user's current balance
    SELECT balance INTO user_balance
    FROM game_state
    WHERE user_id = expired_bid.user_id;

    -- Check if user can afford it
    IF user_balance >= expired_bid.amount THEN
      -- Deduct balance
      UPDATE game_state
      SET balance = balance - expired_bid.amount,
          updated_at = NOW()
      WHERE user_id = expired_bid.user_id;

      -- Transfer script to owned
      INSERT INTO owned_scripts (
        user_id,
        script_id,
        title,
        genre,
        quality,
        complexity,
        purchase_price,
        description,
        tagline,
        required_cast,
        tone
      ) VALUES (
        expired_bid.user_id,
        expired_bid.script_id,
        expired_bid.title,
        expired_bid.genre,
        expired_bid.quality,
        expired_bid.complexity,
        expired_bid.amount,
        expired_bid.description,
        expired_bid.tagline,
        expired_bid.required_cast,
        expired_bid.tone
      );

      -- Create success event (FIXED: events table, not game_events)
      INSERT INTO events (user_id, type, message, read)
      VALUES (
        expired_bid.user_id,
        'GOOD',
        'AUCTION WON: Rights to "' || expired_bid.title || '" secured for $' || expired_bid.amount || '!',
        false
      );

      -- Remove script from market
      DELETE FROM scripts WHERE id = expired_bid.script_id;
    ELSE
      -- Create failure event (FIXED: events table, not game_events)
      INSERT INTO events (user_id, type, message, read)
      VALUES (
        expired_bid.user_id,
        'BAD',
        'AUCTION FAILED: Insufficient funds for "' || expired_bid.title || '". Need $' || expired_bid.amount || '.',
        false
      );
    END IF;

    -- Mark all bids for this script as inactive
    UPDATE bids
    SET is_active = false
    WHERE script_id = expired_bid.script_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
