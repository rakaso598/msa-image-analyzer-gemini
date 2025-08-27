import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const { image, query, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'x-api-key is required' },
        { status: 400 }
      );
    }

    if (!image || !query) {
      return NextResponse.json(
        { error: 'Image and query are required' },
        { status: 400 }
      );
    }

    // Base64 이미지를 Blob으로 변환
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // FormData 생성
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, 'image.jpg');
    formData.append('query', query);

    // 외부 API 호출
    const apiUrl = process.env.API_BASE_URL;
    if (!apiUrl) {
      throw new Error('API_BASE_URL environment variable is not set');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
