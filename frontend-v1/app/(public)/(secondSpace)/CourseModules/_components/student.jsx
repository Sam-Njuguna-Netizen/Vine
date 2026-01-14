import { useState, useEffect } from 'react'
import { Card, Col, Row, Button, Typography, message, Spin, Empty } from 'antd'
import axios from '@/app/api/axios'
import { useRouter } from 'next/navigation'

const { Title, Text, Paragraph } = Typography

const Marketplace = () => {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/marketplace/modules')
      setModules(response.data)
    } catch (error) {
      console.error('Failed to fetch modules', error)
      message.error('Could not load modules from the marketplace.')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePurchase = async (moduleId) => {
    setPurchasingId(moduleId)
    try {
      await axios.post(`/api/marketplace/modules/${moduleId}/purchase`)
      message.success('Module purchased successfully!')
      // Redirect to the "My Modules" page to see the new purchase
      router.push('/CourseModules')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to purchase module. You may already be enrolled.'
      message.error(errorMessage)
    } finally {
        setPurchasingId(null)
    }
  }


  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}><Spin size="large" /></div>
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Explore Course Modules</Title>
      <Paragraph>Browse our catalog of expert-led course modules to find your next learning adventure.</Paragraph>
      
      {modules.length === 0 ? (
        <Empty description="No modules are available in the marketplace right now. Please check back later." />
      ) : (
        <Row gutter={[16, 24]}>
            {modules.map((module) => (
            <Col xs={24} sm={12} md={8} key={module.id}>
              <Card
                hoverable
                actions={[
                    <Button 
                        type="primary" 
                        onClick={() => handlePurchase(module.id)}
                        loading={purchasingId === module.id}
                        disabled={purchasingId !== null}
                    >
                      Buy Now for ${module.price}
                    </Button>
                ]}
              >
                <Card.Meta
                  title={module.name}
                  description={`By ${module.instructor?.full_name || 'Unknown Instructor'}`}
                />
                <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }} style={{marginTop: '12px'}}>
                    {module.description}
                </Paragraph>
                <Text strong>Courses: {module.courses.length}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
export default Marketplace