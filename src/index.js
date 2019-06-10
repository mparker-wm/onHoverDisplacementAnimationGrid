// WebGL code from https://tympanus.net/Development/DistortionHoverEffect/

import React, { useState, useCallback, useMemo } from 'react'
import ReactDOM from 'react-dom'
import * as THREE from 'three'

import { vertexShader, fragmentShader } from './shaders/XFadeShader'

import { Canvas, useThree } from 'react-three-fiber'
import { useSpring, animated as anim } from 'react-spring/three'

import data from './data'
import './styles.css'

function ImageWebgl({ url1, url2, disp, intensity, hovered }) {
  const { progress } = useSpring({ progress: hovered ? 1 : 0 })

  const { gl } = useThree()

  const args = useMemo(
    () => {
      const loader = new THREE.TextureLoader()
      const texture1 = loader.load(url1)
      const texture2 = loader.load(url2)
      const dispTexture = loader.load(disp)

      dispTexture.wrapS = dispTexture.wrapT = THREE.RepeatWrapping
      texture1.magFilter = texture2.magFilter = THREE.LinearFilter
      texture1.minFilter = texture2.minFilter = THREE.LinearFilter

      texture1.anisotropy = gl.capabilities.getMaxAnisotropy()
      texture2.anisotropy = gl.capabilities.getMaxAnisotropy()
      return {
        uniforms: {
          effectFactor: { type: 'f', value: intensity },
          dispFactor: { type: 'f', value: 0 },
          texture: { type: 't', value: texture1 },
          texture2: { type: 't', value: texture2 },
          disp: { type: 't', value: dispTexture }
        },
        vertexShader,
        fragmentShader
      }
    },
    [url1, url2, disp]
  )

  return (
    <mesh>
      <planeBufferGeometry name="geometry" args={[8, 8]} />
      <anim.shaderMaterial name="material" args={[args]} uniforms-dispFactor-value={progress} />
    </mesh>
  )
}

function Image(props) {
  const [hovered, setHover] = useState(false)
  const hover = useCallback(() => setHover(true), [])
  const unhover = useCallback(() => setHover(false), [])
  return (
    <div
      className="item"
      onMouseEnter={hover}
      onMouseLeave={unhover}
      onTouchStart={hover}
      onTouchEnd={unhover}
      onTouchCancel={unhover}
    >
      <Canvas className="canvas" invalidateFrameloop={true}>
        <ImageWebgl {...props} hovered={hovered} />
      </Canvas>
    </div>
  )
}

function App() {
  return (
    <div className="grid">
      {data.map(([url1, url2, disp, intensity], index) => (
        <Image key={index} url1={url1} url2={url2} disp={disp} intensity={intensity} />
      ))}
    </div>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
