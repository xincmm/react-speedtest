import React, { useEffect, useState, useRef } from 'react'

import ProgressBar from 'progressbar.js'
import { STATUS_MAP } from './constant'
import './app.css'

const barOption = {
  strokeWidth: 5,
  color: '#6060ff',
  trailColor: '#eee',
  trailWidth: 5,
  easing: 'easeInOut',
  text: {
    value: '0.00 Mbit/s',
    alignToBottom: false,
  },
  from: { color: '#FFEA82' },
  to: { color: '#ED6A5A' },
}

const progressOption = {
  strokeWidth: 2,
  easing: 'easeInOut',
  duration: 1000,
  color: '#FFEA82',
  trailColor: '#eee',
  trailWidth: 2,
  svgStyle: { width: '100%', height: '100%' },
}

function App() {
  const downloadBarRef = useRef(null)
  const downloadProgressRef = useRef(null)
  const uploadBarRef = useRef(null)
  const uploadProgressRef = useRef(null)
  const [status, setStatus] = useState(2)
  const [ping, setPing] = useState('0.0')
  const [jitter, setJitter] = useState('0.0')

  const mbpsToAmount = (s) => {
    return 1 - 1 / Math.pow(1.3, Math.sqrt(s))
  }

  const handleAbort = () => {
    window.speedtest.abort()
    downloadBarRef.current.set(0)
    downloadBarRef.current.setText('0.00Mbit/s')

    uploadBarRef.current.set(0)
    uploadBarRef.current.setText('0.00Mbit/s')
    setPing('0.0')
    setJitter('0.0')
    setStatus(STATUS_MAP.READY)
  }

  const handleStart = () => {
    if (window.speedtest.getState() === STATUS_MAP.RUNNING) {
      // 正在测速中
    } else {
      window.speedtest.onupdate = (data) => {
        const {
          dlProgress,
          dlStatus,
          ulProgress,
          ulStatus,
          pingStatus,
          jitterStatus,
        } = data
        setJitter(jitterStatus.length === 0 ? '0.0' : jitterStatus)
        setPing(pingStatus.length === 0 ? '0.0' : pingStatus)
        if (downloadBarRef.current) {
          downloadBarRef.current.set(mbpsToAmount(dlStatus))
          downloadProgressRef.current.set(dlProgress)
          downloadBarRef.current.setText(
            `${dlStatus ? dlStatus : '0.00'} Mbit/s`,
          )
        }

        if (uploadBarRef.current) {
          uploadBarRef.current.set(mbpsToAmount(ulStatus))
          uploadProgressRef.current.set(ulProgress)
          uploadBarRef.current.setText(`${ulStatus ? ulStatus : '0.00'} Mbit/s`)
        }
      }
      window.speedtest.onend = () => {
        setStatus(STATUS_MAP.READY)
      }
      setStatus(STATUS_MAP.RUNNING)
      window.speedtest.start()
    }
  }

  useEffect(() => {
    downloadBarRef.current = new ProgressBar.SemiCircle('#download', barOption)
    downloadProgressRef.current = new ProgressBar.Line(
      '#downloadProgress',
      progressOption,
    )

    uploadBarRef.current = new ProgressBar.SemiCircle('#upload', {
      ...barOption,
      color: '#404040',
    })
    uploadProgressRef.current = new ProgressBar.Line(
      '#uploadProgress',
      progressOption,
    )
  }, [])

  return (
    <div className='App'>
      <h1>南京工业大学镜像站测速</h1>
      <header className='App-header'>
        <button
          className={`start ${status === STATUS_MAP.READY ? '' : 'abort'}`}
          onClick={status === STATUS_MAP.READY ? handleStart : handleAbort}
        >
          {status === STATUS_MAP.READY ? '开始测试' : '终止测速'}
        </button>
      </header>
      <div className='testArea2'>
        <div className='ping'>
          <p className='name'>Ping</p>
          <p className='value'>{ping}</p>
          <span className='unit'>ms</span>
        </div>
        <div className='ping'>
          <p className='name'>Jitter</p>
          <p className='value'>{jitter}</p>
          <span className='unit'>ms</span>
        </div>
      </div>
      <div className='testArea'>
        <div>
          <p className='name'>Download</p>
          <div id='download' />
          <div className='progress' id='downloadProgress' />
        </div>

        <div>
          <p className='name'>Upload</p>
          <div id='upload' />
          <div className='progress' id='uploadProgress' />
        </div>
      </div>
    </div>
  )
}

export default App
