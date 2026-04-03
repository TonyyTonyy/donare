import { donationSchema } from '@/app/(app)/doar/_components/donation-step-schema'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    /* const donorId = req.headers.get('x-user-id') ?? ''
    if (!donorId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    } */

    const body = await req.json()
    const parsed = donationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 422 },
      )
    }

    const {
      title,
      description,
      category,
      condition,
      size,
      brand,
      isWorking,
      pickupType,
      pickupAddress,
      pickupCity,
      pickupLatitude,
      pickupLongitude,
      pickupInstructions,
      images,
      primaryImageIndex,
    } = parsed.data

    const product = await prisma.product.create({
      data: {
        title,
        description,
        category: category as any,
        condition: condition as any,
        status: 'ACTIVE',
        size,
        brand,
        isWorking,
        pickupType: pickupType as any,
        pickupAddress,
        pickupCity,
        pickupLatitude,
        pickupLongitude,
        pickupInstructions,
        images,
        primaryImageIndex,
        publishedAt: new Date(),
        donorId: "cmni4drrf00003j6t0lua216x",
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/products]', err)
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 },
    )
  }
}