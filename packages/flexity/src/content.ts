/** biome-ignore-all lint/suspicious/noExplicitAny: JSXElementConstructor<any> is the only way to accept all component elements while rejecting intrinsic HTML elements. This is a deliberate tradeoff — contained to this file. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Fragment, JSXElementConstructor, ReactElement } from 'react'
type AllowedContent =
  | boolean
  | null
  | number
  | ReactElement<unknown, JSXElementConstructor<any>>
  | ReactElement<unknown, typeof Fragment>
  | string
  | undefined
export type { AllowedContent }
