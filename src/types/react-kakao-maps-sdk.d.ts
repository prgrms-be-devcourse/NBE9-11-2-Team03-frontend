declare module "react-kakao-maps-sdk" {
  import type { ComponentType } from "react";

  export const Map: ComponentType<any>;
  export const MapMarker: ComponentType<any>;
  export const ZoomControl: ComponentType<any>;
  export function useKakaoLoader(options: {
    appkey: string;
    libraries?: string[];
    defer?: boolean;
  }): [boolean, Error | null];
  export default {
    Map,
    MapMarker,
    ZoomControl,
    useKakaoLoader,
  };
}
