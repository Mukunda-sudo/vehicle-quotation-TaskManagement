import React, { useEffect, useState,useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';


const DigitalQuotationScreen = ({ route, navigation }) => {
  const {
    userId,
    userName: passedName,
    userMobile: passedMobile,
    dealershipName,
    dealershipAddress,
    rtgsDetails,
  } = route.params || {};

  const [userName, setUserName] = useState(passedName || 'Unknown');
  const [userMobile, setUserMobile] = useState(passedMobile || '---');

  const [quotationData, setQuotationData] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [variantList, setVariantList] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [colorOptions, setColorOptions] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const isFormValid = customerName && selectedPricing;

  const [loading, setLoading] = useState(false);
  const [pdfPath, setPdfPath] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [quotationShared, setQuotationShared] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');



  const validateForm = () => {
  const nameRegex = /^[A-Za-z\s]+$/;
  const mobileRegex = /^\d{10}$/;

  if (!customerName.trim()) {
    Alert.alert("Missing Name", "Please enter the customer's name.");
    return false;
  }

  if (!nameRegex.test(customerName)) {
    Alert.alert("Invalid Name", "Customer name should contain only letters and spaces.");
    return false;
  }

  if (!mobileRegex.test(customerMobile)) {
    Alert.alert("Invalid Mobile", "Mobile number must be exactly 10 digits.");
    return false;
  }

  if (!selectedModel || !selectedVariant || !selectedPricing) {
    Alert.alert("Incomplete Selection", "Please select a model and variant.");
    return false;
  }

  return true;
};



  useEffect(() => {
  fetchQuotationData();
}, []);

const fetchQuotationData = async () => {
  try {
    const response = await fetch(
      'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec'
    );
    const result = await response.json();
    setQuotationData(result);

   
    const uniqueModels = [...new Set(result.map(item => item.Model))];
    setModelList(uniqueModels);

    
    const allColors = result
      .map(item => item.ColorOptions)
      .filter(Boolean) 
      .flatMap(colorStr => colorStr.split(',').map(c => c.trim()));

   
    const uniqueColors = [...new Set(allColors)];
    setColorOptions(uniqueColors);

    console.log('✅ Color Options:', uniqueColors);
  } catch (error) {
    console.error('Error fetching quotation data:', error);
    Alert.alert('Error', 'Failed to load quotation data');
  }
};

const handleGeneratePDF = async () => {
  if (!validateForm()) return;

  setLoading(true);
  setIsGenerating(true);

  try {
  const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `customerName=${encodeURIComponent(customerName)}&mobileNumber=${encodeURIComponent(customerMobile)}&customerAddress=${encodeURIComponent(customerAddress)}&userId=${encodeURIComponent(userId)}&model=${encodeURIComponent(selectedModel)}&variant=${encodeURIComponent(selectedVariant)}&color=${encodeURIComponent(selectedColor)}&totalAmount=${encodeURIComponent(totalAmount)}`

  });

  const result = await response.json();

  if (!result.success) {
    console.error("❌ Failed to save customer data:", result.message);
    Alert.alert("Error", "Failed to save customer data.");
    setIsGenerating(false);
  } else {
    console.log("✅ Customer data saved.");
    await generatePDF();
    setPdfGenerated(true); 
  }
} catch (error) {
  console.error("❌ Error sending customer data:", error);
  Alert.alert("Error", "An unexpected error occurred.");
  setIsGenerating(false); 
} finally {
  setLoading(false);
}

};


useFocusEffect(
  useCallback(() => {
    if (quotationShared) {
      Alert.alert("Success", "Quotation successfully sent!", [
        {
          text: "OK",
          onPress: () => {
            setCustomerName('');
            setCustomerAddress('');
            setCustomerMobile('');
            setSelectedModel('');
            setSelectedVariant('');
            setSelectedColor('');
            setPdfPath('');
            setPdfGenerated(false);
            setIsGenerating(false);
            setQuotationShared(false);
          }
        }
      ]);
    }
  }, [quotationShared])
);


  useEffect(() => {
    if (selectedModel) {
      const variants = [...new Set(
  quotationData
    .filter(item => item.Model === selectedModel)
    .map(item => item.Variant)
)];

      setVariantList(variants);
    }
  }, [selectedModel]);

  useEffect(() => {
  if (selectedVariant) {
    const price = quotationData.find(
      item => item.Model === selectedModel && item.Variant === selectedVariant
    );

    setSelectedPricing(price);

    if (price) {
  const amount = price['On Road (Add : Sr. No.1 to 10)'] || '';
  setTotalAmount(amount);
  console.log('✅ Total Amount Set:', amount);
} else {
  setTotalAmount('');
  console.log('⚠ Price object not found');
}

  }
}, [selectedVariant]);






  useEffect(() => {
  console.log('Received in Quotation:', {
    dealershipName,
    dealershipAddress,
    rtgsDetails,
    userName: passedName,
    userMobile: passedMobile,
  });
}, []);


  const convertToIndianWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
      'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
      'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
      'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };

    return numToWords(Math.floor(num)) + ' Rupees Only';
  };

  const generatePDF = async () => {
    if (!selectedPricing || !customerName || !customerAddress || !customerMobile) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);

    const totalAmount = parseFloat(selectedPricing["On Road (Add : Sr. No.1 to 10)"]);
    const amountInWords = convertToIndianWords(totalAmount).toUpperCase();

   const htmlContent = `
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 8px;
      padding: 20px;
    }
    .header {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
    }
    .sub-header {
      text-align: center;
      font-size: 10px;
      margin-bottom: 5px;
      line-height: 1.4;
    }
    .info-table, .pricing-table, .amount-table, .conditions-table, .footer-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid black;
    }
    .info-table td,
    .pricing-table th, .pricing-table td,
    .amount-table td,
    .conditions-table td,
    .footer-table td {
      border: 1px solid black;
      padding: 4px;
      vertical-align: top;
    }
    .pricing-table th {
      background-color: #f0f0f0;
      text-align: center;
    }
    .pricing-table td:nth-child(1), .pricing-table th:nth-child(1) {
      width: 10%;
      text-align: center;
    }
    .pricing-table td:nth-child(2), .pricing-table th:nth-child(2) {
      width: 60%;
      text-align: left;
    }
    .pricing-table td:nth-child(3), .pricing-table th:nth-child(3) {
      width: 30%;
      text-align: center;
    }
    .amount-table td:nth-child(1) {
      width: 50%;
      font-weight: bold;
    }
    .amount-table td:nth-child(2) {
      width: 50%;
      text-align: center;
      font-weight: bold;
    }
    .conditions-table td {
      width: 50%;
      font-size: 10px;
      line-height: 1.5;
    }
    .footer-table td {
      font-size: 12px;
      vertical-align: top;
    }
    .footer-table td:last-child {
      text-align: right;
    }
    .center-note {
      text-align: center;
      margin-top: 8px;
      font-weight: bold;
      font-size: 7px;
    }
  </style>
</head>
<body>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 20%; text-align: left;">
        <img src="logo.png" style="width: 120px; height: 120px;" />
      </td>


      <td style="width: 60%; text-align: center; font-size: 30px; font-weight: bold;">
  ${dealershipName || 'Dealership Name'}
  <div style="font-size: 11px; font-weight: normal; line-height: 1.4;">
    ${dealershipAddress || 'Dealership Address'}
  </div>


        <div style="margin-top: 5px;">
          <span style="display: inline-block; background-color: black; color: white; padding: 3px 10px; font-size: 13px;">QUOTATION</span>
        </div>
      </td>
      <td style="width: 20%; text-align: right; font-size: 12px;">
        <b>Date:</b> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>
    </tr>
  </table>

  <table class="info-table">
    <tr>
      <th colspan="2" style="text-align: center;">Customer Details</th>
      <th colspan="2" style="text-align: center;">Vehicle Details</th>
    </tr>
    <tr>
      <td><b>Customer Name:</b></td>
      <td>${customerName}</td>
      <td><b>Model Name:</b></td>
      <td>${selectedPricing.Model}</td>
    </tr>
    <tr>
      <td><b>Address:</b></td>
      <td>${customerAddress}</td>
      <td><b>Variant:</b></td>
      <td>${selectedPricing.Variant}</td>
    </tr>
    <tr>
      <td><b>Contact No.:</b></td>
      <td>${customerMobile}</td>
      <td><b>Colour:</b></td>
      <td>${selectedColor || '---'}</td>
    </tr>
  </table>

  <table class="pricing-table">
    <tr><th>Sr No</th><th>Particulars</th><th>Rupees</th></tr>
    <tr><td>1</td><td>Ex Show-room Price</td><td>₹ ${(selectedPricing?.["Ex Show-room Price"] || 0).toLocaleString('en-IN')}</td></tr>
    <tr><td>2</td><td>Insurance With PB+KP+ZD+EP/BP+CM+RTI</td><td>₹ ${Number(selectedPricing["Insurance With PB+KP+ZD+EP/BP+CM+RTI"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>3</td><td>TAX+ Reg Charges RTO</td><td>₹ ${Number(selectedPricing["TAX+ Reg Charges RTO"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>4</td><td>RTO Cess 2%</td><td>₹ ${Number(selectedPricing["RTO Cess 2%"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>5</td><td>TCS</td><td>₹ ${Number(selectedPricing["TCS"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>6</td><td>FASTAG Chrg</td><td>₹ ${Number(selectedPricing["FASTAG Chrg"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>7</td><td>Coating</td><td>₹ ${Number(selectedPricing["Coating"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>8</td><td>Extended Warranty (4th year upto 1,20,000km)</td><td>₹ ${Number(selectedPricing["Extended Warranty (4th year upto 1,20,000km)"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>9</td><td>Shield of Trust(SOT)</td><td>₹ ${Number(selectedPricing["Shield of Trust(SOT)"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>10</td><td>Essential Accessories</td><td>₹ ${Number(selectedPricing["Essential Accessories"]).toLocaleString('en-IN')}</td></tr>
    <tr><td>11</td><td>On Road (Add : Sr. No.1 to 10)</td><td><b>₹ ${totalAmount.toLocaleString('en-IN')}</b></td></tr>
    <tr><td>12</td><td>National Promotion</td><td>-</td></tr>
  </table>

  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
  <tr>
    <td colspan="2" style="border: 1px solid black; background-color: #f0f0f0; text-align: center; font-weight: bold;">
      TOTAL NET PAYMENT AMOUNT
    </td>
  </tr>
  <tr>
    <td style="border: 1px solid black; font-weight: bold; padding: 4px;font-size: 12px; vertical-align: middle;">
  <div style="margin-bottom: 5px;">In Words:-</div>
  <div>${amountInWords}</div>
</td>
<td style="border: 1px solid black; text-align: center; font-size: 18px; font-weight: bold; background-color: #f9f9f9; vertical-align: middle; padding: 8px;">
  ₹ ${totalAmount.toLocaleString('en-IN')}
</td>

  </tr>
</table>

  <table class="conditions-table">
       <tr>
    <td style="width: 50%; font-size: 10px; text-align: left;">
      1. Price and Taxes Prevailing at the time of delivery will apply.<br>
      2. Delivery only after full payment or finance approval.<br>
      3. Registration name change requires new contract.<br>
      4. Disputes subject to Aurangabad jurisdiction.<br>
      5. Delivery to others only with authorization letter.<br>
      6. Delivery from stockyard; home delivery is owner’s risk.
    </td>
    <td style="width: 50%; font-size: 10px; text-align: left;">
      7. Delivery subject to availability.<br>
      8. No interest paid on advance.<br>
      9. Payment within 5 days of booking maturity.<br>
      10. Accessories warranty by manufacturer.<br>
      11. Payment by Cheque/DD/RTGS. Ask for receipt if paying cash.<br>
      <strong>RTGS Details:</strong> ${rtgsDetails}
    </td>
  </tr>
</table>


  </table>

  <table class="footer-table">
    <tr>
      <td rowspan="2">
        <b>Quotation Issued By :</b><br><br>
        DSC Name: ${userName}<br>
        DSC Contact No: ${userMobile}
      </td>
      <td rowspan="2" style="text-align: center; font-size: 10px;">
        ANY DISCOUNT<br>BEING OFFERED<br>WILL BE<br>CALCULATED ON<br><b>"ON ROAD PRICE"</b>
      </td>
      <td rowspan="2" style="text-align: center;">
  <b>${dealershipName}</b><br>
  (Authorised Signatory)
</td>

    </tr>
  </table>

  <div class="center-note" >********** THIS IS SYSTEM GENERATED QUOTATION **********</div>
</body>
</html>
`;

    if (!/^\d{10}$/.test(customerMobile)) {
  Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number.");
  return;
}


    try {
      const options = {
        html: htmlContent,
        fileName: `Quotation_${customerName.replace(/\s/g, '_')}`,
        directory: 'Documents',
      };
      const pdf = await RNHTMLtoPDF.convert(options);
      setPdfPath(pdf.filePath);
      Alert.alert('PDF Generated', 'You can now share it.');
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

 const sharePDF = async () => {
  try {
    if (!pdfPath) return;

    await Share.open({
      url: `file://${pdfPath}`,
      title: 'Share Quotation PDF',
    });

    
    setQuotationShared(true);
  } catch (error) {
    console.error("❌ Error sharing PDF:", error);
  }
};


  



return (
  <View style={{ flex: 1, backgroundColor: '#f2f6ff' }}>
  
    
    <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconContainer}>
    <Icon name="arrow-back-ios" size={22} color="#ffffff" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Digital Quotation</Text>
</View>

    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>👤 Customer Name:</Text>
      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="Enter Customer Name"
      />

      <Text style={styles.label}>🏠 Customer Address:</Text>
      <TextInput
        style={styles.input}
        value={customerAddress}
        onChangeText={setCustomerAddress}
        placeholder="Enter Address"
      />

      <Text style={styles.label}>📞 Customer Mobile:</Text>
      <TextInput
        style={styles.input}
        value={customerMobile}
        onChangeText={setCustomerMobile}
        placeholder="Enter Mobile Number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>🚗 Select Model:</Text>
      <Picker
        selectedValue={selectedModel}
        onValueChange={(value) => {
          setSelectedModel(value);
          setSelectedVariant('');
          setSelectedPricing(null);
        }}
      >
        <Picker.Item label="Select Model" value="" />
        {modelList.map((model, index) => (
          <Picker.Item key={index} label={model} value={model} />
        ))}
      </Picker>

      {variantList.length > 0 && (
        <>
          <Text style={styles.label}>🔧 Select Variant:</Text>
          <Picker
            selectedValue={selectedVariant}
            onValueChange={(value) => {
              setSelectedVariant(value);
              setSelectedColor(colorOptions.length ? colorOptions[0] : '');
            }}
          >
            <Picker.Item label="Select Variant" value="" />
            {variantList.map((variant, index) => (
              <Picker.Item key={index} label={variant} value={variant} />
            ))}
          </Picker>
        </>
      )}

      {selectedVariant !== '' && colorOptions.length > 0 && (
        <>
          <Text style={styles.label}>🎨 Select Colour:</Text>
          <Picker
            selectedValue={selectedColor}
            onValueChange={(value) => setSelectedColor(value)}
          >
            <Picker.Item label="Select Colour" value="" />
            {colorOptions.map((color, index) => (
              <Picker.Item key={index} label={color} value={color} />
            ))}
          </Picker>
        </>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
        <TouchableOpacity
  style={[
    styles.button,
    (!isFormValid || loading || isGenerating) && { backgroundColor: '#ccc' }
  ]}
  onPress={handleGeneratePDF}
  disabled={!isFormValid || loading || isGenerating}
>
  <Text style={styles.buttonText}>
    {pdfGenerated
      ? "✅ Quotation Generated"
      : loading || isGenerating
      ? "⏳ Generating..."
      : "🧾 Generate Quotation PDF"}
  </Text>
</TouchableOpacity>


          {pdfPath && (
            <TouchableOpacity style={styles.shareButton} onPress={sharePDF}>
              <Text style={styles.buttonText}>📤 Share Quotation PDF</Text>
            </TouchableOpacity>

     
          )}
        </>
      )}
    </ScrollView>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  shareButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },


header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 16,
  paddingBottom: 12,
  paddingHorizontal: 16,
  backgroundColor: '#0066cc',
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 3,
},
backButton: {
  flexDirection: 'row',
  alignItems: 'center',
},
backIcon: {
  fontSize: 24,
  color: 'white',
},
backText: {
  color: 'white',
  fontSize: 16,
},
headerTitle: {
  flex: 1,
  textAlign: 'center',
  fontSize: 18,
  fontWeight: 'bold',
  color: 'white',
  marginRight: 40, 

},

});

export default DigitalQuotationScreen;
