/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useStore } from "../../store";
import { GRID_UNIT } from "../../utils";
import { memo, useRef, useEffect } from "react";
import { BorderPlane } from "./BorderPlane";

const Other = memo(function Other({ id, color }) {
  const room = useStore((state) => state.liveblocks.room);

  const ref = useRef();

  useEffect(() => {
    const unsubscribe = room.subscribe("event", ({ event }) => {
      if (event.type === id) {
        const d = event.data;
        ref.current.container.position.x = d.x + (GRID_UNIT.x * d.w) / 2;
        ref.current.container.position.z = d.z  + (GRID_UNIT.z * d.w) / 2;
        ref.current.container.position.y = d.y;

        ref.current.plane.scale.set(d.w, d.d);
        ref.current.plane.material.uniforms.uSize.value.x = d.w;
        ref.current.plane.material.uniforms.uSize.value.y = d.d;
        ref.current.plane.material.uniforms.uBorderWidth.value =
          (Math.min(d.w, d.d) / 50) * 10;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id, room]);

  return (
    <>
      <BorderPlane planeSize={[GRID_UNIT.x, GRID_UNIT.z]} ref={ref} color={color} />
    </>
  );
});

export const Others = () => {
  const others = useStore((state) => state.liveblocks.others);

  return (
    <>
      {others.map((user) => {
        return user.presence?.self ? (
          <Other
            key={user.presence.self.id}
            id={user.presence.self.id}
            color={user.presence.self.color}
          />
        ) : null;
      })}
    </>
  );
};
