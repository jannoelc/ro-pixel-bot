#NoTrayIcon
KeyHistory 0
CoordMode "Pixel", "Screen"
CoordMode "Mouse", "Screen"

stdin := FileOpen("*", "r `n")
stdout := FileOpen("*", "w `n")

write(x) {
  global stdout
  stdout.Write(x)
  stdout.Read(0)
}

writeResult(timestamp, command, result := 1) {
  write("OK`t" timestamp "`t" command "`t" result)
}

Loop {
  x := RTrim(stdin.ReadLine(), "`n")
  data := StrSplit(x, "`t")
  timestamp := data[1]
  command := data[2]

  Switch command
  {

  case "MouseGetPos":
    MouseGetPos &OutX, &OutY
    writeResult(timestamp, command, OutX "|" OutY)

  case "PixelSearch":
    if PixelSearch(&OutX, &OutY, Number(data[3]), Number(data[4]), Number(data[5]), Number(data[6]), Number(data[7]), Number(data[8]))
    {
      writeResult(timestamp, command, OutX "|" OutY)
    }
    Else
    {
      writeResult(timestamp, command, 0)
    }

  case "PixelGetColor":
    color := PixelGetColor(Number(data[3]), Number(data[4]))
    writeResult(timestamp, command, color)

  case "WinActivate":
    if WinExist(data[3])
    {
    WinActivate
    }
    writeResult(timestamp, command)

  case "WinGetPos":
    If WinExist(data[3])
    {
      WinGetPos &OutX, &OutY, &OutWidth, &OutHeight, data[3]
      writeResult(timestamp, command, OutX "|" OutY "|" OutWidth "|" OutHeight)
    }
    Else
    {
      writeResult(timestamp, command, 0)
    }
    

  }
}
