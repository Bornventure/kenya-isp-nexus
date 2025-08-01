
-- Fix the handle_payment_notification function to remove the non-existent status check
CREATE OR REPLACE FUNCTION public.handle_payment_notification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Trigger payment confirmation notification for all payment insertions
  -- Since payments in this table are successful by definition
  IF TG_OP = 'INSERT' THEN
    PERFORM trigger_auto_notification(
      NEW.client_id,
      'payment_received',
      jsonb_build_object(
        'amount', NEW.amount,
        'payment_method', NEW.payment_method,
        'receipt_number', NEW.reference_number,
        'payment_date', NEW.payment_date
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$
