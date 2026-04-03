import { useState, useRef, useCallback } from "react";

const GRAVITY = 1800;
const BASE_VELOCITY = -500;
const MAX_CHARGE_BONUS = -400;
const MAX_CHARGE_TIME = 500; // ms

export function useJumpPhysics() {
  const [y, setY] = useState(0);
  const [isGrounded, setIsGrounded] = useState(true);
  const [isCharging, setIsCharging] = useState(false);

  const yRef = useRef(0);
  const velocityRef = useRef(0);
  const groundedRef = useRef(true);
  const chargingRef = useRef(false);
  const chargeStartRef = useRef(0);

  const startCharge = useCallback(() => {
    if (!groundedRef.current) return;
    chargingRef.current = true;
    chargeStartRef.current = Date.now();
    setIsCharging(true);
  }, []);

  const releaseJump = useCallback(() => {
    if (!chargingRef.current) return;
    chargingRef.current = false;
    setIsCharging(false);

    if (!groundedRef.current) return;

    const chargeTime = Math.min(Date.now() - chargeStartRef.current, MAX_CHARGE_TIME);
    const chargeRatio = chargeTime / MAX_CHARGE_TIME;
    const jumpVelocity = BASE_VELOCITY + MAX_CHARGE_BONUS * chargeRatio;

    velocityRef.current = jumpVelocity;
    groundedRef.current = false;
    setIsGrounded(false);
  }, []);

  const update = useCallback((delta) => {
    if (groundedRef.current && !chargingRef.current) return;

    // Apply gravity
    velocityRef.current += GRAVITY * delta;
    yRef.current += velocityRef.current * delta;

    // Clamp to ground
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
    startCharge,
    releaseJump,
    update,
  };
}
