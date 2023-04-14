import React from 'react'
import Navbar from '../Navbar/Navbar'

// _aoo.tsxで使用する
const Layout = ({children}) => {
  return (
    <div>
        {/*ここにナビゲーションバーを作って、どのページも共通で表示させる */}
        <Navbar />
        {children}
    </div>
  )
}

export default Layout