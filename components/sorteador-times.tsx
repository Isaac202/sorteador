'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function SorteadorTimesComponent() {
  const [inputList, setInputList] = useState('')
  const [numTimes, setNumTimes] = useState(2)
  const [timesSorteados, setTimesSorteados] = useState<string[][]>([])
  const [mensagemCompartilhamento, setMensagemCompartilhamento] = useState('')
  const [copiado, setCopiado] = useState(false)

  const processarLista = (lista: string) => {
    const linhas = lista.split('\n')
    const jogadores = {
      mensalistas: [] as string[],
      diaristas: [] as string[]
    }
    let categoria = ''

    linhas.forEach(linha => {
      if (linha.includes('MENSALISTAS:')) {
        categoria = 'mensalistas'
      } else if (linha.includes('DIARISTAS:')) {
        categoria = 'diaristas'
      } else if (linha.trim() && !linha.startsWith('ATENÇÃO:')) {
        const nome = linha.replace(/^\d+[-\s]*/, '').trim()
        if (nome && categoria) {
          jogadores[categoria].push(nome)
        }
      }
    })

    return jogadores
  }

  const sortearTimes = () => {
    const { mensalistas, diaristas } = processarLista(inputList)
    const todosJogadores = [...mensalistas, ...diaristas]
    const jogadoresPorTime = Math.ceil(todosJogadores.length / numTimes)
    const times: string[][] = Array.from({ length: numTimes }, () => [])

    // Embaralhar jogadores
    for (let i = todosJogadores.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [todosJogadores[i], todosJogadores[j]] = [todosJogadores[j], todosJogadores[i]]
    }

    // Distribuir jogadores
    todosJogadores.forEach((jogador, index) => {
      times[index % numTimes].push(jogador)
    })

    setTimesSorteados(times)
    gerarMensagemCompartilhamento(times)
  }

  const gerarMensagemCompartilhamento = (times: string[][]) => {
    let mensagem = "Times sorteados:\n\n"
    times.forEach((time, index) => {
      mensagem += `Time ${index + 1}:\n`
      time.forEach(jogador => {
        mensagem += `- ${jogador}\n`
      })
      mensagem += '\n'
    })
    setMensagemCompartilhamento(mensagem)
  }

  const copiarParaAreaTransferencia = async () => {
    try {
      await navigator.clipboard.writeText(mensagemCompartilhamento)
      setCopiado(true)
      toast({
        title: "Copiado!",
        description: "A mensagem foi copiada para a área de transferência.",
      })
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sorteador de Times</h1>
      <div className="mb-4">
        <Textarea
          placeholder="Cole aqui a lista de jogadores..."
          value={inputList}
          onChange={(e) => setInputList(e.target.value)}
          rows={10}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="numTimes" className="block mb-2">Número de Times:</label>
        <Input
          type="number"
          id="numTimes"
          value={numTimes}
          onChange={(e) => setNumTimes(parseInt(e.target.value))}
          min={2}
          max={4}
          className="w-full p-2 border rounded"
        />
      </div>
      <Button onClick={sortearTimes} className="w-full mb-4">Sortear Times</Button>
      {timesSorteados.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {timesSorteados.map((time, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Time {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul>
                    {time.map((jogador, jIndex) => (
                      <li key={jIndex} className="mb-1">{jogador}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button 
            onClick={copiarParaAreaTransferencia} 
            className="w-full"
            disabled={copiado}
          >
            {copiado ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Copiar Times para Compartilhar
              </>
            )}
          </Button>
        </>
      )}
    </div>
  )
}