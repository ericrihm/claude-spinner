import { useState, useRef, useCallback } from "react";

const GRAVITY = 1400;
const BASE_VELOCITY = -420;
const MAX_CHARGE_BONUS = -350;
const MAX_CHARGE_TIME = 400; // ms

export function useJumpPhysics() {
  const [y, setY] = useState(0);
  const [isGrounded, setIsGrounded] = useState(true);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);

  const yRef = useRef(0);
  const velocityRef = useRef(0);
  const groundedRef = useRef(true);
  const chargingRef = useRef(false);
  const chargeStartRef = useRef(0);
  const chargeRafRef = useRef(null);

  // Continuously update charge progress while charging
  const updateChargeProgress = useCallback(() => {
    if (!chargingRef.current) return;
    const elapsed = Date.now() - chargeStartRef.current;
    setChargeProgress(Math.min(elapsed / MAX_CHARGE_TIME, 1));
    chargeRafRef.current = requestAnimationFrame(updateChargeProgress);
  }, []);

  const startCharge = useCallback(() => {
    if (!groundedRef.current) return;
    chargingRef.current = true;
    chargeStartRef.current = Date.now();
    setIsCharging(true);
    setChargeProgress(0);
    chargeRafRef.current = requestAnimationFrame(updateChargeProgress);
  }, [updateChargeProgress]);

  const releaseJump = useCallback(() => {
    if (!chargingRef.current) return;
    chargingRef.current = false;
    setIsCharging(false);
    if (chargeRafRef.current) cancelAnimationFrame(chargeRafRef.current);

    if (!groundedRef.current) return;

    const chargeTime = Math.min(Date.now() - chargeStartRef.current, MAX_CHARGE_TIME);
    const chargeRatio = chargeTime / MAX_CHARGE_TIME;
    const jumpVelocity = BASE_VELOCITY + MAX_CHARGE_BONUS * chargeRatio;

    velocityRef.current = jumpVelocity;
    groundedRef.current = false;
    setIsGrounded(false);
    setChargeProgress(0);
  }, []);

  const update = useCallback((delta) => {
    if (groundedRef.current && !chargingRef.current) return;

    velocityRef.current += GRAVITY * delta;
    yRef.current += velocityRef.current * delta;

    if (yRef.current >= 0) {
      yRef.current = 0;
      velocityRef.current = 0;
      if (!groundedRef.current) {
        groundedRef.current = true;
        setIsGrounded(true);
      }
    }

    setY(yRef.current);
  }, []);

  return {
    y,
    yRef,
    isGrounded,
    isCharging,
    chargeProgress,
    startCharge,
    releaseJump,
    update,
  };
}
