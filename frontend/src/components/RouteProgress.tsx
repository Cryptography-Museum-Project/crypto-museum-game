import { Fragment, type ReactNode } from 'react';
import type { VisualType } from '../types';

import smartphoneGrey from '../assets/scenario-visuals/smartphone-notification-icon-grey.svg';
import smartphoneColor from '../assets/scenario-visuals/smartphone-notification-icon-color.svg';
import taxiGrey from '../assets/scenario-visuals/taxi-permissions-icon-grey.svg';
import taxiColor from '../assets/scenario-visuals/taxi-permissions-icon-color.svg';
import cafeGrey from '../assets/scenario-visuals/cafe-wifi-icon-grey.svg';
import cafeColor from '../assets/scenario-visuals/cafe-wifi-icon-color.svg';
import bankCallGrey from '../assets/scenario-visuals/bank-call-code-icon-grey.svg';
import bankCallColor from '../assets/scenario-visuals/bank-call-code-icon-color.svg';
import emailGrey from '../assets/scenario-visuals/work-email-icon-grey.svg';
import emailColor from '../assets/scenario-visuals/work-email-icon-color.svg';
import scamCallGrey from '../assets/scenario-visuals/scam-call-icon-grey.svg';
import scamCallColor from '../assets/scenario-visuals/scam-call-icon-color.svg';
import smartHomeGrey from '../assets/scenario-visuals/smart-home-icon-grey.svg';
import smartHomeColor from '../assets/scenario-visuals/smart-home-icon-color.svg';
import passwordGrey from '../assets/scenario-visuals/password-monitor-icon-grey.svg';
import passwordColor from '../assets/scenario-visuals/password-monitor-icon-color.svg';
import deviceGrey from '../assets/scenario-visuals/avito-apps-icon-grey.svg';
import deviceColor from '../assets/scenario-visuals/avito-apps-icon-color.svg';
import purchaseGrey from '../assets/scenario-visuals/purchase-phone-icon-grey.svg';
import purchaseColor from '../assets/scenario-visuals/purchase-phone-icon-color.svg';
import resultGrey from '../assets/scenario-visuals/result-icon-grey.svg';
import resultColor from '../assets/scenario-visuals/result-icon-color.svg';

interface IconAsset {
  src: string;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

interface RouteIcon {
  grey: IconAsset;
  color: IconAsset;
  overL?: number;
  overR?: number;
}

const ICONS: Partial<Record<VisualType, RouteIcon>> = {
  notification: {
    grey: { src: smartphoneGrey, w: 57, h: 42, cx: 25.25, cy: 20.84 },
    color: { src: smartphoneColor, w: 57, h: 42, cx: 25.25, cy: 20.84 },
    overL: 5,
  },
  permissions: {
    grey: { src: taxiGrey, w: 64, h: 45, cx: 31.77, cy: 23.7 },
    color: { src: taxiColor, w: 64, h: 45, cx: 31.78, cy: 23.71 },
    overL: 9,
    overR: 9,
  },
  wifi: {
    grey: { src: cafeGrey, w: 64, h: 46, cx: 31.52, cy: 24.98 },
    color: { src: cafeColor, w: 64, h: 46, cx: 31.51, cy: 24.98 },
  },
  bankCall: {
    grey: { src: bankCallGrey, w: 64, h: 47, cx: 31.65, cy: 26.13 },
    color: { src: bankCallColor, w: 63, h: 47, cx: 31.48, cy: 26.13 },
    overR: 5,
  },
  email: {
    grey: { src: emailGrey, w: 64, h: 48, cx: 31.98, cy: 20.84 },
    color: { src: emailColor, w: 64, h: 48, cx: 31.54, cy: 20.84 },
  },
  scamCall: {
    grey: { src: scamCallGrey, w: 64, h: 44, cx: 31.89, cy: 23.06 },
    color: { src: scamCallColor, w: 64, h: 44, cx: 31.88, cy: 23.06 },
  },
  smartHome: {
    grey: { src: smartHomeGrey, w: 63, h: 42, cx: 31.52, cy: 20.82 },
    color: { src: smartHomeColor, w: 63, h: 42, cx: 31.51, cy: 20.82 },
  },
  password: {
    grey: { src: passwordGrey, w: 64, h: 43, cx: 31.51, cy: 22.15 },
    color: { src: passwordColor, w: 63, h: 43, cx: 31.49, cy: 22.15 },
  },
  device: {
    grey: { src: deviceGrey, w: 63, h: 46, cx: 31.23, cy: 25.0 },
    color: { src: deviceColor, w: 64, h: 46, cx: 31.64, cy: 25.0 },
  },
  purchase: {
    grey: { src: purchaseGrey, w: 65, h: 44, cx: 30.97, cy: 20.84 },
    color: { src: purchaseColor, w: 65, h: 44, cx: 30.95, cy: 20.84 },
    overR: 9,
  },
};

const RESULT_ICON: RouteIcon = {
  grey: { src: resultGrey, w: 61, h: 58, cx: 31.8, cy: 33.47 },
  color: { src: resultColor, w: 62, h: 58, cx: 31.86, cy: 33.5 },
  overL: 4,
  overR: 4,
};

const CELL_W = 42;
const CELL_H = 59;
const ANCHOR_X = CELL_W / 2;
const ANCHOR_Y = 34;
const CIRCLE_D = 41.5;
const NUMBER_H = 16; // высота строки с номером (h-4)
const NUMBER_GAP = -6; // номер заходит на верх ячейки: над кругом там пусто, а у щита номера нет
const LINE_H = 2;

const DASH_W = 10;

function Connector({ done, padL, padR }: { done: boolean; padL: number; padR: number }) {
  const shift = (padL - padR) / 2;
  return (
    <li
      aria-hidden="true"
      className="relative flex-1 min-w-5"
      style={{
        height: LINE_H,
        marginTop: NUMBER_H + NUMBER_GAP + ANCHOR_Y - LINE_H / 2,
      }}
    >
      <span
        className={`absolute top-0 rounded-full ${done ? 'bg-brand' : 'bg-[#818181]'}`}
        style={{
          width: DASH_W,
          height: LINE_H,
          left: `calc(50% + ${shift - DASH_W / 2}px)`,
        }}
      />
    </li>
  );
}

function IconInCell({ asset, alt }: { asset: IconAsset; alt: string }) {
  return (
    <img
      src={asset.src}
      alt={alt}
      draggable={false}
      className="absolute max-w-none select-none"
      style={{
        width: asset.w,
        height: asset.h,
        left: ANCHOR_X - asset.cx,
        top: ANCHOR_Y - asset.cy,
      }}
    />
  );
}

// Для сценариев, добавленных через админку с визуалом без иконки маршрута.
function FallbackCircle({ done }: { done: boolean }) {
  return (
    <span
      className={`absolute rounded-full ${done ? 'bg-[#A5B6CA]' : 'bg-[#B8B8B8]'}`}
      style={{
        width: CIRCLE_D,
        height: CIRCLE_D,
        left: ANCHOR_X - CIRCLE_D / 2,
        top: ANCHOR_Y - CIRCLE_D / 2,
      }}
    />
  );
}

function Stop({ number, children }: { number?: number; children: ReactNode }) {
  return (
    <li className="relative z-10 shrink-0 flex flex-col items-center" style={{ width: CELL_W }}>
      <span
        className={`font-halvar font-bold text-brand text-[15px] leading-4 h-4 tabular-nums whitespace-nowrap ${number === undefined ? 'invisible' : ''}`}
        aria-hidden="true"
      >
        {number ?? 0}
      </span>
      <span className="relative block" style={{ width: CELL_W, height: CELL_H, marginTop: NUMBER_GAP }}>
        {children}
      </span>
    </li>
  );
}

interface RouteProgressProps {
  // визуалы всех сценариев игры по порядку
  route: VisualType[];
  // сколько сценариев уже пройдено (= индекс текущего); на экране
  // результата — route.length, тогда вся цепочка и щит цветные
  completed: number;
  className?: string;
}

export default function RouteProgress({ route, completed, className = '' }: RouteProgressProps) {
  const allDone = completed >= route.length;

  return (
    <ol aria-label="Маршрут дня" className={`flex items-start pl-[5px] pr-[10px] ${className}`}>
      {route.map((visual, index) => {
        const done = index < completed;
        // иконка текущего сценария цветная сразу при переходе на его экран;
        // тире после неё остаётся серым, пока сценарий не пройден
        const active = index <= completed;
        const icon = ICONS[visual];
        const status = done ? 'пройден' : index === completed ? 'текущий' : 'впереди';
        const label = `Сценарий ${index + 1} — ${status}`;
        return (
          <Fragment key={index}>
            <Stop number={index + 1}>
              {icon ? (
                <IconInCell asset={active ? icon.color : icon.grey} alt={label} />
              ) : (
                <>
                  <FallbackCircle done={active} />
                  <span className="sr-only">{label}</span>
                </>
              )}
            </Stop>
            <Connector
              done={done}
              padL={icon?.overR ?? 0}
              padR={(index + 1 < route.length ? ICONS[route[index + 1]]?.overL : RESULT_ICON.overL) ?? 0}
            />
          </Fragment>
        );
      })}
      <Stop>
        <IconInCell
          asset={allDone ? RESULT_ICON.color : RESULT_ICON.grey}
          alt={allDone ? 'Результат — маршрут пройден' : 'Результат'}
        />
      </Stop>
    </ol>
  );
}